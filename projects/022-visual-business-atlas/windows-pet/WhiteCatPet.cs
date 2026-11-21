using System;
using System.IO;
using System.Linq;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;
[assembly: AssemblyVersion("1.0.1.0")]
[assembly: AssemblyFileVersion("1.0.1.0")]

namespace WhiteCatPet {
  public class StateInfo { public string id; public string label; public string message; }
  public class Behavior {
    public string version, name, feedLine, wakeLine; public int frameMs, happyToIdleMs, idleToHungryMs, hungryToSleepMs;
    public StateInfo[] states; public string[] petLines;
    public StateInfo Find(string id) { return states.First(s => s.id == id); }
    public static Behavior Load() { using (var s=Assembly.GetExecutingAssembly().GetManifestResourceStream("PetData")) using(var r=new StreamReader(s,Encoding.UTF8)) return new JavaScriptSerializer().Deserialize<Behavior>(r.ReadToEnd()); }
  }
  public class PetModel {
    public string State="idle", Message; public int Clicks; public long Changed; public bool Paused;
    public readonly Behavior Config;
    public PetModel(Behavior config,long now) { Config=config; Changed=now; Message=config.Find(State).message; }
    public void Set(string state,long now) { Config.Find(state); State=state; Changed=now; Message=Config.Find(state).message; }
    public void Act(string action,long now) {
      if(action=="pet") { bool asleep=State=="sleep"; Set("happy",now); Message=asleep?Config.wakeLine:Config.petLines[Clicks%Config.petLines.Length]; Clicks++; }
      else if(action=="feed") { Set("happy",now); Message=Config.feedLine; }
      else if(action=="rest") Set("sleep",now);
      else if(action=="wake") {Set("idle",now);Message=Config.wakeLine;}
    }
    public bool Tick(long now) {
      if(Paused) {Changed=now;return false;}
      long elapsed=now-Changed;
      if(State=="happy"&&elapsed>=Config.happyToIdleMs) {Set("idle",now);return true;}
      if(State=="idle"&&elapsed>=Config.idleToHungryMs) {Set("hungry",now);return true;}
      if(State=="hungry"&&elapsed>=Config.hungryToSleepMs) {Set("sleep",now);return true;}
      return false;
    }
  }
  public class Settings { public int X=int.MinValue,Y=int.MinValue,Size=220; public bool Topmost=true,Paused=false; }
  static class Program {
    [STAThread] static int Main(string[] args) {
      try {
        var config=Behavior.Load();
        if(args.Length>0&&args[0]=="--self-test") return SelfTest(config,args.Length>1?args[1]:"self-test.txt");
        bool created; using(var mutex=new Mutex(true,"Local\\WhiteCatPet-v1",out created)) {
          if(!created) { MessageBox.Show("白猫已经在运行，请在桌面或托盘找到它。","傲娇白猫"); return 0; }
          Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false);
          Application.Run(new PetWindow(config));
        }
        return 0;
      } catch(Exception e) { MessageBox.Show("白猫启动失败："+e.Message,"傲娇白猫",MessageBoxButtons.OK,MessageBoxIcon.Error); return 1; }
    }
    static int SelfTest(Behavior c,string file) {
      var lines=new System.Collections.Generic.List<string>(); Action<bool,string> ok=(pass,name)=>{if(!pass)throw new Exception("FAIL: "+name);lines.Add("PASS: "+name);};
      var m=new PetModel(c,0);ok(m.State=="idle","initial idle");m.Act("pet",10);ok(m.State=="happy"&&m.Clicks==1,"click -> happy");m.Tick(10+c.happyToIdleMs);ok(m.State=="idle","happy timeout -> idle");m.Tick(10+c.happyToIdleMs+c.idleToHungryMs);ok(m.State=="hungry","idle timeout -> hungry");m.Tick(m.Changed+c.hungryToSleepMs);ok(m.State=="sleep","hungry timeout -> sleep");m.Act("pet",90000);ok(m.State=="happy"&&m.Message==c.wakeLine,"click wakes sleeping pet");m.Act("feed",90001);ok(m.Message==c.feedLine,"feeding response");m.Act("rest",90002);ok(m.State=="sleep","manual rest");m.Act("wake",90003);m.Paused=true;m.Tick(200000);ok(m.State=="idle","paused auto transition");m.Paused=false;m.Tick(200001);ok(m.State=="idle","resume has fresh timeout");
      var hashes=new System.Collections.Generic.HashSet<string>();
      foreach(var s in c.states) for(int f=0;f<2;f++) using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream(s.id+"_"+f+".png")) {ok(stream!=null,"embedded "+s.id+" frame "+f);using(var memory=new MemoryStream()){stream.CopyTo(memory);var bytes=memory.ToArray();hashes.Add(Convert.ToBase64String(System.Security.Cryptography.SHA256.Create().ComputeHash(bytes)));using(var image=new Bitmap(new MemoryStream(bytes))){ok(image.Width==256&&image.Height==256,"frame dimensions");ok(image.GetPixel(0,0).A==0,"transparent frame corner");}}}
      ok(hashes.Count==8,"eight distinct exported frames");File.WriteAllLines(Path.GetFullPath(file),lines,Encoding.UTF8);return 0;
    }
  }
  public class PetWindow : Form {
    readonly Behavior config; readonly PetModel model; readonly System.Windows.Forms.Timer timer; readonly NotifyIcon tray; readonly ContextMenuStrip menu;
    readonly System.Collections.Generic.Dictionary<string,Bitmap[]> frames=new System.Collections.Generic.Dictionary<string,Bitmap[]>();
    Settings settings; readonly string settingsFile; readonly DateTime started=DateTime.UtcNow;
    Point mouseStart,windowStart; bool moving,pressed,hidden; int frame,lastFrame=-1; string lastState=""; int lastWidth; ToolStripMenuItem pauseItem,topItem;
    long Now {get{return (long)(DateTime.UtcNow-started).TotalMilliseconds;}}
    public PetWindow(Behavior c) {
      config=c;model=new PetModel(c,0);settingsFile=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"WhiteCatPet.settings.json");settings=LoadSettings();model.Paused=settings.Paused;
      foreach(var state in c.states){var a=new Bitmap[2];for(int i=0;i<2;i++)using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream(state.id+"_"+i+".png"))using(var source=new Bitmap(stream))a[i]=new Bitmap(source);frames[state.id]=a;}
      Text="傲娇白猫 · 待机";FormBorderStyle=FormBorderStyle.None;ShowInTaskbar=false;TopMost=settings.Topmost;StartPosition=FormStartPosition.Manual;
      AccessibleName="傲娇白猫桌面宠物";AccessibleDescription="单击摸摸，拖动移动，右键菜单切换状态和退出";
      Size=new Size(settings.Size+24,settings.Size+112);
      var area=Screen.PrimaryScreen.WorkingArea;Location=settings.X==int.MinValue?new Point(area.Right-Width-45,area.Bottom-Height-30):new Point(settings.X,settings.Y);ClampToScreen();
      menu=new ContextMenuStrip();menu.Items.Add("摸摸它",null,(s,e)=>Interact("pet"));menu.Items.Add("喂一口",null,(s,e)=>Interact("feed"));menu.Items.Add("睡一会儿",null,(s,e)=>Interact("rest"));menu.Items.Add("叫醒 / 回到待机",null,(s,e)=>Interact("wake"));
      var states=new ToolStripMenuItem("切换状态");foreach(var st in c.states){string id=st.id;states.DropDownItems.Add(st.label,null,(s,e)=>{model.Set(id,Now);RenderFrame();});}menu.Items.Add(states);menu.Items.Add(new ToolStripSeparator());
      pauseItem=new ToolStripMenuItem("暂停自动变化"){Checked=model.Paused,CheckOnClick=true};pauseItem.Click+=(s,e)=>{model.Paused=pauseItem.Checked;model.Changed=Now;SaveSettings();};menu.Items.Add(pauseItem);
      topItem=new ToolStripMenuItem("保持置顶"){Checked=TopMost,CheckOnClick=true};topItem.Click+=(s,e)=>{TopMost=topItem.Checked;SaveSettings();};menu.Items.Add(topItem);
      var sizes=new ToolStripMenuItem("角色大小");foreach(int n in new[]{160,220,280}){int chosen=n;sizes.DropDownItems.Add(n+" px",null,(s,e)=>{settings.Size=chosen;Size=new Size(chosen+24,chosen+112);ClampToScreen();RenderFrame();SaveSettings();});}menu.Items.Add(sizes);
      menu.Items.Add("移回屏幕右下角",null,(s,e)=>{var a=Screen.FromPoint(Cursor.Position).WorkingArea;Location=new Point(a.Right-Width-25,a.Bottom-Height-25);SaveSettings();RenderFrame();});
      menu.Items.Add("隐藏到托盘",null,(s,e)=>{hidden=true;Hide();});menu.Items.Add("使用帮助",null,(s,e)=>MessageBox.Show("单击白猫：摸摸 / 叫醒\n按住白猫拖动：移动位置\n右键：喂食、睡觉、状态、大小和退出\n托盘双击：重新显示白猫\n\n自动变化：待机20秒→催饭15秒→睡觉；开心4.5秒后回到待机。可以暂停。\n离线预设互动，不使用网络或麦克风。","傲娇白猫 · 使用帮助"));menu.Items.Add(new ToolStripSeparator());menu.Items.Add("退出白猫",null,(s,e)=>Close());
      tray=new NotifyIcon{Text="傲娇白猫 · 右键菜单 / 双击显示",Icon=System.Drawing.Icon.ExtractAssociatedIcon(Application.ExecutablePath),ContextMenuStrip=menu,Visible=true};tray.DoubleClick+=(s,e)=>{hidden=false;Show();ClampToScreen();RenderFrame();};
      timer=new System.Windows.Forms.Timer{Interval=100};timer.Tick+=(s,e)=>{model.Tick(Now);frame=(int)(Now/config.frameMs)%2;if(!hidden&&(frame!=lastFrame||model.State!=lastState||Width!=lastWidth))RenderFrame();};
      Shown+=(s,e)=>{RenderFrame();timer.Start();};
      MouseDown+=(s,e)=>{if(e.Button==MouseButtons.Left){pressed=true;moving=false;mouseStart=Cursor.Position;windowStart=Location;Capture=true;}else if(e.Button==MouseButtons.Right)menu.Show(Cursor.Position);};
      MouseMove+=(s,e)=>{if(!pressed)return;if((Control.MouseButtons&MouseButtons.Left)==0){pressed=false;moving=false;return;}var d=new Point(Cursor.Position.X-mouseStart.X,Cursor.Position.Y-mouseStart.Y);if(Math.Abs(d.X)+Math.Abs(d.Y)>5)moving=true;if(moving){Location=new Point(windowStart.X+d.X,windowStart.Y+d.Y);RenderFrame();}};
      MouseCaptureChanged+=(s,e)=>{if(!Capture){pressed=false;moving=false;}};
      MouseUp+=(s,e)=>{if(e.Button!=MouseButtons.Left||!pressed)return;bool wasMoving=moving;pressed=false;Capture=false;if(wasMoving){ClampToScreen();SaveSettings();RenderFrame();}else Interact("pet");};
      Microsoft.Win32.SystemEvents.DisplaySettingsChanged+=DisplayChanged;
    }
    protected override bool ShowWithoutActivation { get { return true; } }
    protected override CreateParams CreateParams {get{var p=base.CreateParams;p.ExStyle|=0x80000|0x80;return p;}}
    protected override void WndProc(ref Message m){if(m.Msg==0x21){m.Result=new IntPtr(3);return;}base.WndProc(ref m);}
    void Interact(string action){model.Act(action,Now);RenderFrame();}
    void DisplayChanged(object sender,EventArgs e){if(IsDisposed)return;BeginInvoke((Action)(()=>{ClampToScreen();RenderFrame();}));}
    Settings LoadSettings(){try{var s=new JavaScriptSerializer().Deserialize<Settings>(File.ReadAllText(settingsFile,Encoding.UTF8));if(s==null)throw new Exception();s.Size=Math.Max(160,Math.Min(280,s.Size));return s;}catch{return new Settings();}}
    void SaveSettings(){settings.X=Left;settings.Y=Top;settings.Topmost=TopMost;settings.Paused=model.Paused;try{File.WriteAllText(settingsFile,new JavaScriptSerializer().Serialize(settings),Encoding.UTF8);}catch(IOException){}catch(UnauthorizedAccessException){}}
    void ClampToScreen(){Rectangle working=Screen.FromRectangle(Bounds).WorkingArea;Left=Math.Max(working.Left,Math.Min(working.Right-Width,Left));Top=Math.Max(working.Top,Math.Min(working.Bottom-Height,Top));}
    void RenderFrame(){
      if(!IsHandleCreated||IsDisposed||hidden)return;
      Text="傲娇白猫 · "+config.Find(model.State).label;
      using(var canvas=new Bitmap(Width,Height,PixelFormat.Format32bppPArgb))using(var g=Graphics.FromImage(canvas)){
        g.SmoothingMode=SmoothingMode.AntiAlias;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.Clear(Color.Transparent);
        var bubble=new Rectangle(6,5,Width-12,73);using(var shape=Rounded(bubble,13))using(var fill=new SolidBrush(Color.FromArgb(248,249,247,230)))using(var pen=new Pen(Color.FromArgb(210,171,190,149),1)){g.FillPath(fill,shape);g.DrawPath(pen,shape);}
        g.TextRenderingHint=System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;
        using(var font=new Font("Microsoft YaHei UI",10,FontStyle.Regular))using(var brush=new SolidBrush(Color.FromArgb(49,79,51)))g.DrawString(model.Message,font,brush,new RectangleF(17,16,Width-34,58));
        g.DrawImage(frames[model.State][frame],new Rectangle(12,85,settings.Size,settings.Size));
        using(var font=new Font("Microsoft YaHei UI",8))using(var brush=new SolidBrush(Color.FromArgb(225,61,86,52)))g.DrawString(config.Find(model.State).label+" · 右键菜单",font,brush,new RectangleF(24,Height-22,Width-48,19),new StringFormat{Alignment=StringAlignment.Center});
        Layered.Update(Handle,canvas,Left,Top);
      }
      lastFrame=frame;lastState=model.State;lastWidth=Width;
    }
    static GraphicsPath Rounded(Rectangle r,int radius){var p=new GraphicsPath();int d=radius*2;p.AddArc(r.X,r.Y,d,d,180,90);p.AddArc(r.Right-d,r.Y,d,d,270,90);p.AddArc(r.Right-d,r.Bottom-d,d,d,0,90);p.AddArc(r.X,r.Bottom-d,d,d,90,90);p.CloseFigure();return p;}
    protected override void OnFormClosed(FormClosedEventArgs e){timer.Stop();timer.Dispose();SaveSettings();tray.Visible=false;tray.Dispose();menu.Dispose();Microsoft.Win32.SystemEvents.DisplaySettingsChanged-=DisplayChanged;foreach(var a in frames.Values)foreach(var b in a)b.Dispose();base.OnFormClosed(e);}
  }
  static class Layered {
    [StructLayout(LayoutKind.Sequential)]struct POINT{public int x,y;public POINT(int a,int b){x=a;y=b;}}
    [StructLayout(LayoutKind.Sequential)]struct SIZE{public int w,h;public SIZE(int a,int b){w=a;h=b;}}
    [StructLayout(LayoutKind.Sequential,Pack=1)]struct BLEND{public byte op,flags,alpha,format;}
    [DllImport("user32.dll")]static extern IntPtr GetDC(IntPtr w);
    [DllImport("user32.dll")]static extern int ReleaseDC(IntPtr w,IntPtr dc);
    [DllImport("gdi32.dll")]static extern IntPtr CreateCompatibleDC(IntPtr dc);
    [DllImport("gdi32.dll")]static extern bool DeleteDC(IntPtr dc);
    [DllImport("gdi32.dll")]static extern IntPtr SelectObject(IntPtr dc,IntPtr obj);
    [DllImport("gdi32.dll")]static extern bool DeleteObject(IntPtr obj);
    [DllImport("user32.dll",SetLastError=true)]static extern bool UpdateLayeredWindow(IntPtr hwnd,IntPtr dst,ref POINT location,ref SIZE size,IntPtr src,ref POINT origin,int key,ref BLEND blend,int flags);
    public static void Update(IntPtr window,Bitmap image,int x,int y){IntPtr screen=GetDC(IntPtr.Zero),memory=CreateCompatibleDC(screen),bitmap=IntPtr.Zero,previous=IntPtr.Zero;try{bitmap=image.GetHbitmap(Color.FromArgb(0));previous=SelectObject(memory,bitmap);var location=new POINT(x,y);var size=new SIZE(image.Width,image.Height);var origin=new POINT(0,0);var blend=new BLEND{op=0,flags=0,alpha=255,format=1};if(!UpdateLayeredWindow(window,screen,ref location,ref size,memory,ref origin,0,ref blend,2))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());}finally{if(previous!=IntPtr.Zero)SelectObject(memory,previous);if(bitmap!=IntPtr.Zero)DeleteObject(bitmap);DeleteDC(memory);ReleaseDC(IntPtr.Zero,screen);}}
  }
}
