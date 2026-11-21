function simulateCitySystem({ mode = 'coordinated', policy = 'care', forecastEnabled = true } = {}) {
  if (!['isolated', 'coordinated'].includes(mode) || !['care', 'industry'].includes(policy)) {
    throw new RangeError('Unknown city simulation mode or priority.');
  }

  // Each forecast row covers one hour. Power is in MW and storage is in MWh.
  const districts = ['city', 'clinic', 'home', 'logistics', 'work'];
  const forecast = [
    [13, '热浪前', 94, 12, 14, 22, 10, 26],
    [14, '供电降容', 78, 16, 16, 28, 12, 28],
    [15, '降温负荷上涨', 66, 18, 18, 32, 12, 28],
    [16, '热浪峰值', 60, 18, 18, 34, 12, 26],
    [17, '高温持续', 66, 16, 16, 30, 10, 24],
    [18, '气温回落', 78, 14, 14, 24, 8, 22],
  ].map(([hour, title, grid, ...load]) => ({
    hour, title, grid,
    demand: Object.fromEntries(districts.map((district, i) => [district, load[i]])),
    totalDemand: load.reduce((sum, demand) => sum + demand, 0),
  }));
  const coordinated = mode === 'coordinated';
  const plansAhead = coordinated && forecastEnabled;
  const priority = policy === 'care'
    ? ['clinic', 'logistics', 'home', 'city', 'work']
    : ['work', 'city', 'clinic', 'logistics', 'home'];
  const initialBattery = 24;
  const dischargeLimit = 10;
  const availableDischarge = (battery, demand, grid) =>
    Math.min(dischargeLimit, battery, Math.max(0, demand - grid));
  const waterMinimum = (demand) => Math.ceil(demand.city * .82);

  function allocate(demand, totalDemand, available) {
    if (available >= totalDemand) return { ...demand };
    if (!coordinated) {
      const shares = districts.map((district) => [district, demand[district] * available / totalDemand]);
      const assigned = Object.fromEntries(shares.map(([district, share]) => [district, Math.floor(share)]));
      const remainder = available - Object.values(assigned).reduce((sum, power) => sum + power, 0);
      shares.sort(([, a], [, b]) => (b % 1) - (a % 1));
      for (const [district] of shares.slice(0, remainder)) assigned[district] += 1;
      return assigned;
    }

    const floors = {
      city: waterMinimum(demand), clinic: 12, home: 12, logistics: 6, work: 6,
    };
    const assigned = {};
    let remaining = available;
    for (const district of districts) {
      assigned[district] = Math.min(remaining, floors[district], demand[district]);
      remaining -= assigned[district];
    }
    for (const district of priority) {
      const increase = Math.min(remaining, demand[district] - assigned[district]);
      assigned[district] += increase;
      remaining -= increase;
    }
    return assigned;
  }

  function effects(demand, allocated, derating) {
    const waterReady = allocated.city >= waterMinimum(demand);
    const shuttles = waterReady && allocated.logistics >= 7
      ? Math.min((allocated.logistics - 6) * 4, (allocated.city - 10) * 5)
      : 0;
    const coolingTrips = shuttles * 35;
    return {
      waterReady,
      shuttles,
      coolingTrips,
      coolingPeople: allocated.home * 45 + coolingTrips,
      // Underpowered water pumps reduce grid cooling capacity in the following hour.
      nextDerating: waterReady ? Math.max(0, derating - 8) : Math.min(22, derating + 11),
    };
  }

  const plans = new Map();
  function reserve(index, batteryRemaining, derating) {
    if (index === forecast.length) return { release: 0, score: 0 };
    const key = `${index}:${batteryRemaining}:${derating}`;
    if (plans.has(key)) return plans.get(key);
    const { demand, totalDemand, grid } = forecast[index];
    const gridSupply = grid - derating;
    const limit = availableDischarge(batteryRemaining, totalDemand, gridSupply);
    let best = { release: 0, score: -Infinity };
    for (let release = 0; release <= limit; release += 1) {
      const allocation = allocate(demand, totalDemand, gridSupply + release);
      const result = effects(demand, allocation, derating);
      // Preserve the grid and critical services, then apply the human-set priority.
      const score = policy === 'care'
        ? allocation.clinic * 10 + result.coolingPeople / 12 + allocation.work
        : allocation.clinic * 4 + result.coolingPeople / 60 + allocation.work * 8;
      const next = reserve(index + 1, batteryRemaining - release, result.nextDerating);
      if (score + next.score > best.score) best = { release, score: score + next.score };
    }
    plans.set(key, best);
    return best;
  }

  let batteryRemaining = initialBattery;
  let derating = 0;
  let coolingPeople = 0;
  let clinicHoursAtRisk = 0;
  let workDeferred = 0;
  let workUnserved = 0;
  return forecast.map(({ hour, title, grid: forecastGrid, demand, totalDemand }, index) => {
    const grid = forecastGrid - derating;
    const batteryBefore = batteryRemaining;
    const dischargeIfImmediate = availableDischarge(batteryBefore, totalDemand, grid);
    const battery = plansAhead ? reserve(index, batteryBefore, derating).release : dischargeIfImmediate;
    batteryRemaining -= battery;
    const total = grid + battery;
    const allocated = allocate(demand, totalDemand, total);
    const result = effects(demand, allocated, derating);
    const workShortfall = demand.work - allocated.work;
    const shiftedWork = coordinated ? Math.min(18, workShortfall) : 0;
    const gap = Math.max(0, totalDemand - total);
    coolingPeople += result.coolingPeople;
    clinicHoursAtRisk += Number(allocated.clinic < demand.clinic);
    workDeferred += shiftedWork;
    workUnserved += workShortfall - shiftedWork;

    const districtStates = Object.fromEntries(districts.map((district) => {
      const level = allocated[district] / demand[district];
      const critical = district === 'city' ? !result.waterReady : level < .55;
      return [district, {
        demand: demand[district],
        allocated: allocated[district],
        level,
        status: critical ? 'critical' : level < 1 ? 'limited' : 'normal',
      }];
    }));
    const flows = districts.filter((district) => district !== 'city' && allocated[district] > 0).map((district) => ({
      from: 'city', to: district, amount: allocated[district], kind: 'energy',
      intensity: districtStates[district].level,
    }));
    if (result.coolingTrips) flows.push({
      from: 'logistics', to: 'home', amount: result.coolingTrips, kind: 'people',
      intensity: Math.min(1, result.coolingTrips / 840),
    });

    let action = '电网余量覆盖各区用电，储能待命。';
    if (gap && !coordinated) {
      action = result.waterReady
        ? '各区按比例限电，储能直接补充当前缺口。'
        : '供水泵低于最低功率，避暑接驳停运，电网冷却持续受限。';
    } else if (gap) {
      const storage = battery ? `储能补充 ${battery} MW`
        : batteryRemaining ? '储能留待后续时段' : '储能已用尽';
      action = `保障水泵供电，${shiftedWork ? `工厂移峰 ${shiftedWork} MW` : '维持当班生产'}，${storage}。`;
    }
    const snapshot = {
      index, hour, title, action, mode, policy, flows, forecastEnabled: plansAhead,
      supply: {
        grid, battery, total, demand: totalDemand, gap, derating,
        batteryBefore, dischargeIfImmediate, batteryHeld: dischargeIfImmediate - battery,
        batteryRemaining, batteryCapacity: initialBattery,
      },
      districts: districtStates,
      metrics: { coolingPeople, clinicHoursAtRisk, workDeferred, workUnserved, batteryRemaining },
      shiftedWork,
      waterReady: result.waterReady,
      waterMinimum: waterMinimum(demand),
      coolingTrips: result.coolingTrips,
      shuttles: result.shuttles,
    };
    derating = result.nextDerating;
    return snapshot;
  });
}
