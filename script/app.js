// ─── DATA ─────────────────────────────────────────────────────────────────────

var student = {
  name: "Alexandra Chen", id: "STU-2024-0847", program: "Computer Science",
  year: "3rd Year", gpa: "3.82", email: "a.chen@university.edu",
  phone: "+1 (555) 204-8731", initials: "AC", status: "Active",
  clearanceLevel: "Level 3 – Standard",
};

var resources = [
  { id:"RES-001", name:"Computer Lab 1",           category:"Laboratory",     sensitivity:"Standard",     levelReq:2 },
  { id:"RES-002", name:"Computer Lab 2",           category:"Laboratory",     sensitivity:"Standard",     levelReq:2 },
  { id:"RES-003", name:"Computer Lab 3",           category:"Laboratory",     sensitivity:"Standard",     levelReq:2 },
  { id:"RES-004", name:"Research Laboratory A",    category:"Research",       sensitivity:"Restricted",   levelReq:4 },
  { id:"RES-005", name:"Research Laboratory B",    category:"Research",       sensitivity:"Restricted",   levelReq:4 },
  { id:"RES-006", name:"Server Room A",            category:"Infrastructure", sensitivity:"High Security",levelReq:5 },
  { id:"RES-007", name:"Server Room B",            category:"Infrastructure", sensitivity:"High Security",levelReq:5 },
  { id:"RES-008", name:"Library Digital Archives", category:"Academic",       sensitivity:"Standard",     levelReq:1 },
  { id:"RES-009", name:"Network Operations Center",category:"Infrastructure", sensitivity:"Classified",   levelReq:5 },
  { id:"RES-010", name:"Database Admin Console",   category:"Systems",        sensitivity:"High Security",levelReq:5 },
  { id:"RES-011", name:"Administrative Records",   category:"Administrative", sensitivity:"Restricted",   levelReq:3 },
  { id:"RES-012", name:"Cybersecurity Lab",        category:"Laboratory",     sensitivity:"Restricted",   levelReq:4 },
];

var activeAccesses = [
  { id:"ACC-001", resource:"Computer Lab 3",          type:"Standard Use", granted:"Sep 5, 2024",  expires:"Jun 30, 2025", daysLeft:10,  status:"Expiring Soon", sensitivity:"Standard",   lp:true },
  { id:"ACC-002", resource:"Library Digital Archives",type:"View Only",    granted:"Sep 1, 2024",  expires:"Jun 30, 2025", daysLeft:10,  status:"Expiring Soon", sensitivity:"Standard",   lp:true },
  { id:"ACC-003", resource:"Research Laboratory A",   type:"Standard Use", granted:"Mar 10, 2025", expires:"Mar 9, 2026",  daysLeft:192, status:"Active",         sensitivity:"Restricted", lp:true },
  { id:"ACC-004", resource:"Cybersecurity Lab",       type:"Standard Use", granted:"Jan 15, 2025", expires:"Sep 5, 2025",  daysLeft:7,   status:"Expiring Soon", sensitivity:"Restricted", lp:true },
];

var allRequests = [
  { id:"REQ-2025-001", resource:"Research Laboratory A",      permType:"Standard Use",   level:"Level 4", duration:"1 Year",     submitted:"Aug 20, 2025", status:"Approved",    reviewer:"Dr. Martinez",  justification:"Graduate research project on neural network architectures." },
  { id:"REQ-2025-002", resource:"Server Room B",              permType:"View Only",      level:"Level 3", duration:"1 Semester", submitted:"Jul 14, 2025", status:"Under Review",reviewer:"Pending",        justification:"Network infrastructure course lab requirement." },
  { id:"REQ-2025-003", resource:"Network Operations Center",  permType:"Administrative", level:"Level 5", duration:"1 Week",     submitted:"Jun 3, 2025",  status:"Rejected",    reviewer:"Admin Office",   justification:"One-time access for system configuration project." },
  { id:"REQ-2024-012", resource:"Computer Lab 3",             permType:"Standard Use",   level:"Level 2", duration:"1 Semester", submitted:"Dec 10, 2024", status:"Approved",    reviewer:"Prof. Williams", justification:"Required for CS304 Software Engineering coursework." },
  { id:"REQ-2024-008", resource:"Cybersecurity Lab",          permType:"Standard Use",   level:"Level 4", duration:"1 Semester", submitted:"Aug 31, 2024", status:"Approved",    reviewer:"Dr. Kim",        justification:"Cybersecurity elective course requirements." },
  { id:"REQ-2024-003", resource:"Library Digital Archives",   permType:"View Only",      level:"Level 1", duration:"1 Year",     submitted:"Aug 25, 2024", status:"Approved",    reviewer:"Library Admin",  justification:"Academic research and reference materials access." },
];

var notificationsData = [
  { id:"N-001", type:"approval",  title:"Access Request Approved",  message:"Your request for Research Laboratory A (REQ-2025-001) has been approved by Dr. Martinez.", time:"2 days ago",   read:false },
  { id:"N-002", type:"expiring",  title:"Access Expiring Soon",     message:"Your access to Cybersecurity Lab (ACC-004) expires in 7 days on Sep 5, 2025.",            time:"1 day ago",    read:false },
  { id:"N-003", type:"expiring",  title:"Access Expiring Soon",     message:"Your access to Computer Lab 3 (ACC-001) expires in 10 days on Jun 30, 2025.",             time:"3 days ago",   read:false },
  { id:"N-004", type:"rejection", title:"Access Request Rejected",  message:"Your request for Network Operations Center (REQ-2025-003) was rejected — insufficient authorization level.", time:"3 months ago", read:true },
  { id:"N-005", type:"security",  title:"Security Policy Updated",  message:"The university security access policy has been updated. Please review the new guidelines before your next request.", time:"1 week ago",   read:true },
  { id:"N-006", type:"system",    title:"Scheduled Maintenance",    message:"The access management system will undergo maintenance on Sep 1, 2025 from 2:00–4:00 AM.", time:"2 weeks ago",  read:true },
  { id:"N-007", type:"approval",  title:"Access Request Approved",  message:"Your request for Cybersecurity Lab (REQ-2024-008) has been approved by Dr. Kim.",          time:"Aug 31, 2024", read:true },
];

var auditLogs = [
  { id:"LOG-001", timestamp:"Aug 27, 2025 \xb7 09:14 AM", action:"Access Request Approved",  resource:"Research Laboratory A",    category:"Access Control", result:"Success", ip:"192.168.1.45", actor:"Dr. Martinez (Reviewer)" },
  { id:"LOG-002", timestamp:"Aug 20, 2025 \xb7 02:31 PM", action:"Access Request Submitted", resource:"Research Laboratory A",    category:"Access Request", result:"Success", ip:"10.0.2.15",    actor:"You" },
  { id:"LOG-003", timestamp:"Jul 14, 2025 \xb7 11:05 AM", action:"Access Request Submitted", resource:"Server Room B",            category:"Access Request", result:"Success", ip:"10.0.2.15",    actor:"You" },
  { id:"LOG-004", timestamp:"Jun 10, 2025 \xb7 08:50 AM", action:"Access Request Rejected",  resource:"Network Operations Center",category:"Access Control", result:"Denied",  ip:"192.168.1.1",  actor:"Admin Office (Reviewer)" },
  { id:"LOG-005", timestamp:"Jun 3, 2025 \xb7 04:22 PM",  action:"Access Request Submitted", resource:"Network Operations Center",category:"Access Request", result:"Success", ip:"10.0.2.15",    actor:"You" },
  { id:"LOG-006", timestamp:"Mar 10, 2025 \xb7 10:00 AM", action:"Access Grant Issued",      resource:"Research Laboratory A",    category:"Access Grant",   result:"Success", ip:"System",       actor:"System (Auto)" },
  { id:"LOG-007", timestamp:"Jan 15, 2025 \xb7 02:15 PM", action:"Login – 2FA Verified",resource:"Student Portal",           category:"Authentication", result:"Success", ip:"10.0.2.15",    actor:"You" },
  { id:"LOG-008", timestamp:"Jan 5, 2025 \xb7 09:03 AM",  action:"Password Changed",         resource:"Account Security",         category:"Authentication", result:"Success", ip:"10.0.2.15",    actor:"You" },
  { id:"LOG-009", timestamp:"Dec 10, 2024 \xb7 03:44 PM", action:"Access Grant Issued",      resource:"Computer Lab 3",           category:"Access Grant",   result:"Success", ip:"System",       actor:"System (Auto)" },
  { id:"LOG-010", timestamp:"Sep 5, 2024 \xb7 08:00 AM",  action:"Identity Verified",        resource:"Student Portal",           category:"Authentication", result:"Success", ip:"10.0.2.15",    actor:"You" },
];

var gradesData = [
  { code:"CS301",   subject:"Data Structures & Algorithms", units:3, grade:"A",  points:4.0, status:"Passed" },
  { code:"CS302",   subject:"Computer Networks",            units:3, grade:"A-", points:3.7, status:"Passed" },
  { code:"CS303",   subject:"Database Management Systems",  units:3, grade:"B+", points:3.3, status:"Passed" },
  { code:"CS304",   subject:"Software Engineering",         units:3, grade:"A",  points:4.0, status:"Passed" },
  { code:"MATH201", subject:"Discrete Mathematics",         units:3, grade:"B+", points:3.3, status:"Passed" },
  { code:"CS305",   subject:"Operating Systems",            units:3, grade:"A-", points:3.7, status:"Passed" },
];

var documentsData = [
  { id:"DOC-001", name:"Student ID Card",            type:"Identification", issued:"Aug 15, 2024", expiry:"Aug 15, 2028", status:"Active",         size:"1.2 MB" },
  { id:"DOC-002", name:"Enrollment Certificate",     type:"Academic",       issued:"Sep 1, 2024",  expiry:"Jun 30, 2025", status:"Active",         size:"340 KB" },
  { id:"DOC-003", name:"Access Permission Form",     type:"Security",       issued:"Sep 5, 2024",  expiry:"Jun 30, 2025", status:"Pending Review", size:"512 KB" },
  { id:"DOC-004", name:"Lab Access Authorization",   type:"Security",       issued:"Oct 2, 2024",  expiry:"Jun 30, 2025", status:"Active",         size:"276 KB" },
  { id:"DOC-005", name:"Transcript (Sem 1 2024)",    type:"Academic",       issued:"Jan 15, 2025", expiry:"N/A",          status:"Active",         size:"890 KB" },
  { id:"DOC-006", name:"Research Facility Clearance",type:"Security",       issued:"Mar 10, 2025", expiry:"Mar 9, 2026",  status:"Approved",       size:"1.1 MB" },
];

// ─── STATE ────────────────────────────────────────────────────────────────────

var state = {
  loggedIn: false,
  page: "home",
  loginStep: "credentials",  // credentials | identity | eligibility
  otp: "",
  eligIdx: -1,
  eligTimer: null,
  histFilter: "All",
  auditFilter: "All",
  notifications: notificationsData.map(function(n){ return Object.assign({},n); }),
  accesses: activeAccesses.map(function(a){ return Object.assign({},a); }),
  revokeId: null,
  showModal: false,
  agreed: false,
  submitted: false,
  selectedRes: "",
  expandRow: null,
  sidebarOpen: false,
  docSearch: "",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function svgIcon(d, size) {
  size = size || 16;
  return '<svg width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="'+d+'"/></svg>';
}

function badge(status) {
  var map = {
    Active:"b-green", Approved:"b-green", Passed:"b-green", Success:"b-green", Eligible:"b-green",
    Pending:"b-amber", "Under Review":"b-amber", "Pending Review":"b-amber",
    "Expiring Soon":"b-orange",
    Rejected:"b-red", Denied:"b-red", Revoked:"b-red",
  };
  return '<span class="badge '+(map[status]||"b-slate")+'">'+status+'</span>';
}

function pip(level) {
  var map = { Standard:"pip-standard", Restricted:"pip-restricted", "High Security":"pip-high", Classified:"pip-classified" };
  var lock = (level==="High Security"||level==="Classified")
    ? svgIcon("M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",10)
    : "";
  return '<span class="pip '+(map[level]||"pip-standard")+'">'+lock+level+'</span>';
}

function catTag(c) {
  var map = { Authentication:"cat-auth","Access Request":"cat-request","Access Control":"cat-control","Access Grant":"cat-grant" };
  return '<span class="'+(map[c]||"cat-auth")+'">'+c+'</span>';
}

function unread()    { return state.notifications.filter(function(n){ return !n.read; }).length; }
function pending()   { return allRequests.filter(function(r){ return r.status==="Under Review"; }).length; }
function expiring()  { return state.accesses.filter(function(a){ return a.status==="Expiring Soon"; }).length; }

function $(id)  { return document.getElementById(id); }
function h(str) { return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// ─── RENDER ROOT ──────────────────────────────────────────────────────────────

function render() {
  var root = document.getElementById("root");
  if (!state.loggedIn) {
    root.innerHTML = renderLogin();
  } else {
    root.innerHTML = renderApp();
    updateNavBadges();
  }
  bindGlobal();
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

var eligibilityItems = [
  "Enrollment status: Active",
  "Academic standing: Good",
  "GPA requirement: 3.82 / 2.00 minimum",
  "Policy violations: None on record",
  "ID verification: Confirmed",
];

function renderLogin() {
  var stepIdx = { credentials:0, identity:1, eligibility:2 };
  var cur = stepIdx[state.loginStep];
  function dot(i) {
    if (cur > i)  return '<div class="step-dot done">'+svgIcon("M5 13l4 4L19 7",12)+'</div>';
    if (cur === i) return '<div class="step-dot active">'+(i+1)+'</div>';
    return '<div class="step-dot pending">'+(i+1)+'</div>';
  }
  function line(i) { return '<div class="step-line '+(cur>i?"done":"pending")+'"></div>'; }

  var steps = '<div class="steps">'+dot(0)+line(0)+dot(1)+line(1)+dot(2)+'</div>';

  var inner = "";

  if (state.loginStep === "credentials") {
    inner = '<div class="space-y">'
      +'<div><div style="font-size:18px;font-weight:700;color:#fff;">Sign In</div>'
      +'<div style="font-size:13px;color:#64748b;margin-top:2px;">Authentication — enter your student credentials</div></div>'
      +'<div><label class="lbl">Student ID</label><input class="inp" type="text" id="inp-id" value="STU-2024-0847" placeholder="STU-YYYY-XXXX"></div>'
      +'<div><label class="lbl">Password</label><input class="inp" type="password" id="inp-pw" value="secret1234" placeholder="Enter password"></div>'
      +'<button onclick="handleCredentials()" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;font-size:14px;border-radius:12px;">'
      +svgIcon("M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1")
      +'Sign In</button>'
      +'</div>';
  } else if (state.loginStep === "identity") {
    inner = '<div class="space-y">'
      +'<div><div style="font-size:18px;font-weight:700;color:#fff;">Identity Verification</div>'
      +'<div style="font-size:13px;color:#64748b;margin-top:2px;">Two-factor authentication required</div></div>'
      +'<div style="background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.5);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">'
      +'<div style="width:36px;height:36px;border-radius:8px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);display:flex;align-items:center;justify-content:center;color:#818cf8;flex-shrink:0;">'
      +svgIcon("M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",16)+'</div>'
      +'<div><div style="font-size:11px;color:#94a3b8;">Verification code sent to</div>'
      +'<div style="font-size:14px;font-weight:600;color:#fff;">+1 (555) ***-8731</div></div></div>'
      +'<div><label class="lbl">Enter Verification Code</label>'
      +'<input class="inp mono" type="text" id="inp-otp" maxlength="6" placeholder="6-digit code" value="'+h(state.otp)+'" oninput="state.otp=this.value.replace(/\\D/g,\'\');this.value=state.otp;document.getElementById(\'verify-btn\').disabled=state.otp.length<4;" style="text-align:center;font-size:22px;letter-spacing:.5em;">'
      +'<div style="font-size:12px;color:#475569;margin-top:6px;text-align:center;">Demo code: <span style="color:#818cf8;font-family:monospace;">284719</span></div></div>'
      +'<button id="verify-btn" onclick="handleIdentity()" class="btn btn-primary" '+(state.otp.length>=4?"":"disabled")+' style="width:100%;justify-content:center;padding:12px;font-size:14px;border-radius:12px;">'
      +svgIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z")
      +'Verify Identity</button>'
      +'</div>';
  } else {
    var items = eligibilityItems.map(function(item, i) {
      var done = state.eligIdx >= i;
      return '<div class="elig-item '+(done?"done":"pending")+'">'
        +'<div class="elig-check '+(done?"done":"pending")+'">'
        +(done ? svgIcon("M5 13l4 4L19 7",12) : '<div style="width:8px;height:8px;border-radius:50%;background:#334155;"></div>')
        +'</div>'
        +'<span style="font-size:13px;color:'+(done?"#cbd5e1":"#475569")+';">'+h(item)+'</span>'
        +'</div>';
    }).join("");
    var enter = (state.eligIdx >= eligibilityItems.length-1)
      ? '<div style="padding-top:4px;">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'
        +'<div style="width:8px;height:8px;border-radius:50%;background:#34d399;"></div>'
        +'<span style="font-size:13px;color:#34d399;font-weight:600;">All checks passed — you are eligible</span>'
        +'</div>'
        +'<button onclick="enterSystem()" class="btn" style="width:100%;justify-content:center;padding:12px;font-size:14px;border-radius:12px;background:#059669;color:#fff;">'
        +svgIcon("M13 7l5 5m0 0l-5 5m5-5H6")
        +'Enter System</button>'
        +'</div>'
      : "";
    inner = '<div class="space-y">'
      +'<div><div style="font-size:18px;font-weight:700;color:#fff;">Eligibility Verification</div>'
      +'<div style="font-size:13px;color:#64748b;margin-top:2px;">Checking your access eligibility…</div></div>'
      +'<div class="space-y-sm">'+items+'</div>'
      +enter
      +'</div>';
  }

  return '<div class="login-wrap">'
    +'<div style="width:100%;max-width:420px;">'
    +'<div style="text-align:center;margin-bottom:32px;">'
    +'<div style="width:56px;height:56px;border-radius:16px;background:#4f46e5;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 24px rgba(79,70,229,.4);">'
    +svgIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",24)
    +'</div>'
    +'<div style="font-size:20px;font-weight:700;color:#fff;">SecureAccess</div>'
    +'<div style="font-size:13px;color:#475569;margin-top:4px;">Student Access Permission Management System</div>'
    +'</div>'
    +steps
    +'<div class="login-card">'+inner+'</div>'
    +'<div style="text-align:center;font-size:11px;color:#1e293b;margin-top:24px;">University Access Permission Management System v2.4</div>'
    +'</div>'
    +'</div>';
}

function handleCredentials() {
  state.loginStep = "identity";
  render();
}
function handleIdentity() {
  if (state.otp.length < 4) return;
  state.loginStep = "eligibility";
  state.eligIdx = -1;
  render();
  var i = 0;
  state.eligTimer = setInterval(function() {
    state.eligIdx = i;
    i++;
    var items = document.querySelectorAll(".elig-item");
    var checks = document.querySelectorAll(".elig-check");
    var texts = document.querySelectorAll(".elig-item span");
    if (items[i-1]) {
      items[i-1].className = "elig-item done";
      checks[i-1].className = "elig-check done";
      checks[i-1].innerHTML = svgIcon("M5 13l4 4L19 7",12);
      if (texts[i-1]) texts[i-1].style.color = "#cbd5e1";
    }
    if (i >= eligibilityItems.length) {
      clearInterval(state.eligTimer);
      // show enter button
      setTimeout(function(){
        var space = document.querySelector(".login-card .space-y");
        if (space) {
          var enterDiv = document.createElement("div");
          enterDiv.style.paddingTop = "4px";
          enterDiv.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'
            +'<div style="width:8px;height:8px;border-radius:50%;background:#34d399;"></div>'
            +'<span style="font-size:13px;color:#34d399;font-weight:600;">All checks passed — you are eligible</span>'
            +'</div>'
            +'<button onclick="enterSystem()" class="btn" style="width:100%;justify-content:center;padding:12px;font-size:14px;border-radius:12px;background:#059669;color:#fff;">'
            +svgIcon("M13 7l5 5m0 0l-5 5m5-5H6")
            +'Enter System</button>';
          space.appendChild(enterDiv);
        }
      }, 200);
    }
  }, 420);
}
function enterSystem() {
  state.loggedIn = true;
  state.page = "home";
  render();
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

var navGroups = [
  { label:"Overview", items:[
    { id:"home",          label:"Dashboard",        badge:"",              icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id:"notifications", label:"Notifications",    badge:"notif",         icon:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  ]},
  { label:"Access Management", items:[
    { id:"access-requests",label:"Access Requests", badge:"pending",       icon:"M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
    { id:"history",        label:"Request History", badge:"",              icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { id:"monitoring",     label:"Access Monitoring",badge:"expiring",     icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ]},
  { label:"Academic", items:[
    { id:"grades",    label:"Grades",    badge:"", icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id:"documents", label:"Documents", badge:"", icon:"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" },
  ]},
  { label:"Security", items:[
    { id:"audit-logs", label:"Audit Logs", badge:"", icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ]},
];

function renderApp() {
  var badges = { notifications: unread(), "access-requests": pending(), monitoring: expiring() };

  var sidebarNav = navGroups.map(function(g){
    var items = g.items.map(function(item){
      var bv = badges[item.id] || 0;
      var bc = item.id === "monitoring" ? "orange" : "";
      return '<button class="nav-item'+(state.page===item.id?" active":"")
        +'" onclick="nav(\''+item.id+'\')">'
        +svgIcon(item.icon,16)
        +'<span>'+item.label+'</span>'
        +(bv ? '<span class="nav-badge '+bc+'">'+bv+'</span>' : "")
        +'</button>';
    }).join("");
    return '<div style="margin-bottom:16px;">'
      +'<span class="nav-group-label">'+g.label+'</span>'
      +items
      +'</div>';
  }).join("");

  var settingsBtn = '<div>'
    +'<span class="nav-group-label">Account</span>'
    +'<button class="nav-item'+(state.page==="settings"?" active":"")
    +'" onclick="nav(\'settings\')">'
    +svgIcon("M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z")
    +'Settings</button>'
    +'</div>';

  var sidebar = '<aside class="sidebar'+(state.sidebarOpen?" open":"")
    +'" id="sidebar">'
    // Logo
    +'<div class="sb-logo">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
    +'<div style="width:36px;height:36px;border-radius:12px;background:#4f46e5;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
    +svgIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",18)
    +'</div>'
    +'<div><div style="font-size:14px;font-weight:700;color:#fff;line-height:1;">SecureAccess</div>'
    +'<div style="font-size:11px;color:#475569;margin-top:2px;">Student Portal</div></div>'
    +'</div></div>'
    // Profile
    +'<div class="sb-profile">'
    +'<div class="profile-box">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
    +'<div class="avatar-lg">'+student.initials+'</div>'
    +'<div style="min-width:0;">'
    +'<div style="font-size:14px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+h(student.name)+'</div>'
    +'<div style="font-size:11px;color:#94a3b8;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+h(student.id)+'</div>'
    +'</div></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">'
    +'<div class="meta-box"><div style="font-size:11px;color:#475569;">Program</div><div style="font-size:11px;font-weight:500;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+h(student.program)+'</div></div>'
    +'<div class="meta-box"><div style="font-size:11px;color:#475569;">Year</div><div style="font-size:11px;font-weight:500;color:#cbd5e1;">'+h(student.year)+'</div></div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:6px;margin-top:10px;">'
    +'<div style="width:6px;height:6px;border-radius:50%;background:#34d399;" class="animate-pulse"></div>'
    +'<div style="font-size:11px;color:#34d399;">'+h(student.status)+' \xb7 Verified</div>'
    +'</div>'
    +'</div></div>'
    // Nav
    +'<nav class="sb-nav">'+sidebarNav+settingsBtn+'</nav>'
    // Logout
    +'<div class="sb-footer">'
    +'<button class="logout-btn" onclick="logout()">'
    +svgIcon("M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",16)
    +'Log Out</button>'
    +'</div>'
    +'</aside>';

  var header = '<header class="main-header">'
    +'<button class="menu-btn" onclick="toggleSidebar()">'
    +svgIcon("M4 6h16M4 12h16M4 18h16",20)
    +'</button>'
    +'<div style="flex:1;">'
    +'<div style="font-size:11px;color:#475569;">Student Access Permission Request Process Improvement</div>'
    +'<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Management System</div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:8px;">'
    +'<button onclick="nav(\'notifications\')" style="position:relative;padding:8px;border-radius:8px;background:transparent;border:none;color:#94a3b8;transition:background .15s;" onmouseover="this.style.background=\'#1e293b\'" onmouseout="this.style.background=\'transparent\'">'
    +svgIcon("M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",20)
    +(unread() > 0 ? '<span style="position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;background:#818cf8;"></span>' : "")
    +'</button>'
    +'<div class="avatar-sm">'+student.initials+'</div>'
    +'</div>'
    +'</header>';

  var pmap = {
    home: renderHome,
    "access-requests": renderAccessRequests,
    history: renderHistory,
    notifications: renderNotifications,
    monitoring: renderMonitoring,
    "audit-logs": renderAuditLogs,
    grades: renderGrades,
    documents: renderDocuments,
    settings: renderSettings,
  };
  var pageContent = (pmap[state.page] || renderHome)();

  return '<div class="app-shell">'
    +'<div class="sidebar-overlay'+(state.sidebarOpen?" open":"")
    +'" id="sidebar-overlay" onclick="closeSidebar()"></div>'
    +sidebar
    +'<div class="main-area">'
    +header
    +'<main class="main-content"><div class="page-inner">'+pageContent+'</div></main>'
    +'</div>'
    +(state.showModal ? renderModal() : "")
    +(state.revokeId ? renderRevokeModal() : "")
    +'</div>';
}

function nav(page) {
  state.page = page;
  state.sidebarOpen = false;
  render();
  window.scrollTo(0,0);
}
function logout() { state.loggedIn=false; state.loginStep="credentials"; state.otp=""; render(); }
function toggleSidebar() { state.sidebarOpen = !state.sidebarOpen; render(); }
function closeSidebar()  { state.sidebarOpen = false; render(); }
function updateNavBadges() {}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function renderHome() {
  var exp = activeAccesses.filter(function(a){ return a.status==="Expiring Soon"; });
  var unr = unread();

  var alert = exp.length > 0 ? '<div class="alert-orange">'
    +'<div style="color:#fb923c;flex-shrink:0;margin-top:2px;">'+svgIcon("M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",20)+'</div>'
    +'<div style="flex:1;">'
    +'<div style="font-size:13px;font-weight:600;color:#fed7aa;">Access Expiration Alert</div>'
    +'<div style="font-size:12px;color:rgba(251,146,60,.8);margin-top:2px;">'+exp.length+' active access'+(exp.length>1?"es are":" is")+' expiring soon — '+exp.map(function(e){return e.resource;}).join(", ")+'.</div>'
    +'</div>'
    +'<button onclick="nav(\'monitoring\')" style="font-size:12px;color:#fb923c;background:none;border:none;cursor:pointer;flex-shrink:0;">View →</button>'
    +'</div>' : "";

  var stats = [
    { label:"GPA",              value:student.gpa,  sub:"Academic standing",  color:"#34d399", iconBg:"bg-emerald",  icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label:"Active Accesses",  value:activeAccesses.length, sub:"Granted resources", color:"#818cf8", iconBg:"bg-indigo", icon:"M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
    { label:"Pending Requests", value:allRequests.filter(function(r){return r.status==="Under Review";}).length, sub:"Awaiting review", color:"#fbbf24", iconBg:"bg-amber", icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label:"Notifications",    value:unr, sub:"Unread messages", color:"#a78bfa", iconBg:"bg-violet", icon:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  ];
  var iconColors = ["rgba(16,185,129,.1)","rgba(99,102,241,.1)","rgba(245,158,11,.1)","rgba(139,92,246,.1)"];
  var iconTextColors = ["#34d399","#818cf8","#fbbf24","#a78bfa"];

  var statsHtml = '<div class="grid-4">'
    +stats.map(function(s,i){
      return '<div class="stat-card">'
        +'<div class="stat-icon" style="background:'+iconColors[i]+';color:'+iconTextColors[i]+';">'
        +svgIcon(s.icon,16)+'</div>'
        +'<div style="font-size:28px;font-weight:800;color:'+s.color+';">'+s.value+'</div>'
        +'<div style="font-size:12px;color:#94a3b8;font-weight:500;margin-top:2px;">'+s.label+'</div>'
        +'<div style="font-size:11px;color:#475569;margin-top:2px;">'+s.sub+'</div>'
        +'</div>';
    }).join("")
    +'</div>';

  var recentReqs = allRequests.slice(0,4).map(function(r){
    return '<div class="divide-row hover-row" style="padding:12px 20px;display:flex;align-items:center;gap:12px;">'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:13px;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+h(r.resource)+'</div>'
      +'<div style="font-size:11px;color:#475569;margin-top:2px;">'+h(r.permType)+' \xb7 '+h(r.submitted)+'</div>'
      +'</div>'+badge(r.status)+'</div>';
  }).join("");

  var activeAcc = activeAccesses.map(function(a){
    return '<div class="divide-row hover-row" style="padding:12px 20px;display:flex;align-items:center;gap:12px;">'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:13px;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+h(a.resource)+'</div>'
      +'<div style="font-size:11px;color:#475569;margin-top:2px;">Expires '+h(a.expires)+'</div>'
      +'</div>'+badge(a.status)+'</div>';
  }).join("");

  return '<div class="space-y">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Dashboard</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Welcome back, '+student.name.split(" ")[0]+'. Your security clearance summary.</div></div>'
    // Clearance banner
    +'<div class="clearance-banner">'
    +'<div style="position:relative;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
    +'<div style="width:44px;height:44px;border-radius:12px;background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.4);display:flex;align-items:center;justify-content:center;color:#818cf8;">'
    +svgIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",20)
    +'</div>'
    +'<div style="flex:1;">'
    +'<div style="font-size:11px;color:#a5b4fc;font-weight:500;text-transform:uppercase;letter-spacing:.08em;">Security Clearance</div>'
    +'<div style="font-size:22px;font-weight:800;color:#fff;">'+h(student.clearanceLevel)+'</div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:8px;">'
    +'<div style="width:8px;height:8px;border-radius:50%;background:#34d399;" class="animate-pulse"></div>'
    +'<span style="font-size:13px;color:#34d399;font-weight:500;">Identity Verified \xb7 Active</span>'
    +'</div></div></div>'
    +alert
    +statsHtml
    +'<div class="grid-2">'
    // Recent requests panel
    +'<div class="card" style="overflow:hidden;">'
    +'<div style="padding:16px 20px;border-bottom:1px solid rgba(51,65,85,.5);display:flex;align-items:center;justify-content:space-between;">'
    +'<span style="font-size:13px;font-weight:600;color:#fff;">Recent Requests</span>'
    +'<button onclick="nav(\'history\')" style="font-size:12px;color:#818cf8;background:none;border:none;cursor:pointer;">View all →</button>'
    +'</div>'+recentReqs+'</div>'
    // Active accesses panel
    +'<div class="card" style="overflow:hidden;">'
    +'<div style="padding:16px 20px;border-bottom:1px solid rgba(51,65,85,.5);display:flex;align-items:center;justify-content:space-between;">'
    +'<span style="font-size:13px;font-weight:600;color:#fff;">Active Accesses</span>'
    +'<button onclick="nav(\'monitoring\')" style="font-size:12px;color:#818cf8;background:none;border:none;cursor:pointer;">Monitor →</button>'
    +'</div>'+activeAcc+'</div>'
    +'</div>'
    +'</div>';
}

// ─── ACCESS REQUESTS ──────────────────────────────────────────────────────────

function renderAccessRequests() {
  var rows = allRequests.map(function(r, i){
    var expanded = state.expandRow === r.id;
    var stripe = i%2 !== 0 ? ' style="background:rgba(30,41,59,.3)"' : "";
    var main = '<tr class="hover-row" style="cursor:pointer;border-bottom:1px solid rgba(51,65,85,.3);"'+stripe
      +' onclick="toggleRow(\''+r.id+'\')">'
      +'<td style="padding:14px 20px;" class="mono" style="font-size:12px;color:#818cf8;"><span style="font-size:12px;font-family:\'JetBrains Mono\',monospace;color:#818cf8;">'+h(r.id)+'</span></td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#e2e8f0;">'+h(r.resource)+'</td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#cbd5e1;">'+h(r.permType)+'</td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#94a3b8;">'+h(r.duration)+'</td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#94a3b8;">'+h(r.submitted)+'</td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#94a3b8;">'+h(r.reviewer)+'</td>'
      +'<td style="padding:14px 20px;">'+badge(r.status)+'</td>'
      +'</tr>';
    var detail = expanded ? '<tr style="border-bottom:1px solid rgba(51,65,85,.3);background:rgba(30,41,59,.5);">'
      +'<td colspan="7" style="padding:12px 20px;">'
      +'<div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Justification</div>'
      +'<div style="font-size:13px;color:#cbd5e1;">'+h(r.justification)+'</div>'
      +'</td></tr>' : "";
    return main + detail;
  }).join("");

  var statCols = [
    { label:"Total Submitted", value:allRequests.length,                                          color:"#e2e8f0" },
    { label:"Approved",        value:allRequests.filter(function(r){return r.status==="Approved";}).length, color:"#34d399" },
    { label:"Under Review",    value:allRequests.filter(function(r){return r.status==="Under Review";}).length, color:"#fbbf24" },
  ];

  return '<div class="space-y">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Access Permission Requests</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Submit, track, and manage facility access requests</div></div>'
    +'<button onclick="openModal()" class="btn btn-primary" style="font-size:13px;">'
    +svgIcon("M12 4v16m8-8H4")+'New Request</button>'
    +'</div>'
    +'<div class="grid-3">'
    +statCols.map(function(s){
      return '<div class="stat-card">'
        +'<div style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">'+s.label+'</div>'
        +'<div style="font-size:32px;font-weight:800;color:'+s.color+';margin-top:4px;">'+s.value+'</div>'
        +'</div>';
    }).join("")
    +'</div>'
    +'<div class="card" style="overflow:hidden;">'
    +'<table class="tbl"><thead><tr>'
    +["Request ID","Resource","Permission Type","Duration","Submitted","Reviewer","Status"].map(function(h2){
      return '<th>'+h2+'</th>';
    }).join("")
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div>'
    +'</div>';
}

function toggleRow(id) {
  state.expandRow = (state.expandRow === id) ? null : id;
  render();
}

// ─── NEW REQUEST MODAL ─────────────────────────────────────────────────────────

function openModal()  { state.showModal=true; state.agreed=false; state.submitted=false; state.selectedRes=""; render(); }
function closeModal() { state.showModal=false; state.agreed=false; state.selectedRes=""; render(); }

function renderModal() {
  var sel = resources.find(function(r){ return r.id === state.selectedRes; });
  var resOptions = resources.map(function(r){
    return '<option value="'+r.id+'"'+(state.selectedRes===r.id?' selected':'')+'>'+h(r.name)+' — '+h(r.sensitivity)+'</option>';
  }).join("");
  var sensPill = sel ? '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;">'
    +pip(sel.sensitivity)
    +'<span style="font-size:12px;color:#475569;">'+h(sel.category)+' \xb7 Min. Level '+sel.levelReq+'</span>'
    +((sel.sensitivity==="High Security"||sel.sensitivity==="Classified")
      ? '<span class="sensitive-warn">'+svgIcon("M12 9v2m0 4h.01",12)+' Sensitive resource — additional review required</span>'
      : "")
    +'</div>' : "";

  var cbStyle = state.agreed
    ? 'style="width:20px;height:20px;border-radius:4px;background:#4f46e5;border:2px solid #4f46e5;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;margin-top:2px;"'
    : 'style="width:20px;height:20px;border-radius:4px;background:#1e293b;border:2px solid #475569;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;margin-top:2px;"';

  var btnHtml = state.submitted
    ? '<button class="btn" style="padding:10px 32px;background:#1e293b;color:#34d399;border-radius:12px;font-size:13px;">'
      +svgIcon("M5 13l4 4L19 7",16)+' <span style="color:#34d399;">Submitted!</span></button>'
    : '<button onclick="submitRequest()" class="btn '+(state.agreed?"btn-primary":"")
      +'" '+(state.agreed?"":'disabled style="background:#334155;color:#475569;cursor:not-allowed;"')
      +' style="padding:10px 32px;border-radius:12px;font-size:13px;">'
      +svgIcon("M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z")+'Confirm &amp; Submit</button>';

  var sectionLabel = function(icon, text) {
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">'
      +'<div style="width:24px;height:24px;border-radius:6px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);display:flex;align-items:center;justify-content:center;color:#818cf8;">'
      +svgIcon(icon,14)+'</div>'
      +'<span style="font-size:11px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:.1em;">'+text+'</span>'
      +'<span style="flex:1;height:1px;background:rgba(99,102,241,.2);"></span>'
      +'</div>';
  };

  return '<div class="overlay" onclick="if(event.target===this)closeModal()">'
    +'<div class="modal">'
    // Header
    +'<div class="modal-header">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
    +'<div style="width:40px;height:40px;border-radius:12px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);display:flex;align-items:center;justify-content:center;color:#818cf8;">'
    +svgIcon("M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",20)
    +'</div>'
    +'<div><div style="font-size:18px;font-weight:700;color:#fff;">New Access Request</div>'
    +'<div style="font-size:12px;color:#475569;">Fill in all required fields to submit your permission request</div></div>'
    +'</div>'
    +'<button onclick="closeModal()" style="padding:8px;border-radius:8px;background:transparent;border:none;color:#64748b;cursor:pointer;" onmouseover="this.style.background=\'#1e293b\'" onmouseout="this.style.background=\'transparent\'">'
    +svgIcon("M6 18L18 6M6 6l12 12",20)+'</button>'
    +'</div>'
    // Body
    +'<div class="modal-body">'
    +'<div class="grid-c2">'
    // Left: personal
    +'<div>'
    +sectionLabel("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z","Personal Information")
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">'
    +'<div><label class="lbl">First Name <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label><input class="inp" type="text" placeholder="Alexandra"></div>'
    +'<div><label class="lbl">Surname <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label><input class="inp" type="text" placeholder="Chen"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-bottom:12px;">'
    +'<div><label class="lbl">Middle Name</label><input class="inp" type="text" placeholder="Marie"></div>'
    +'<div><label class="lbl">Suffix</label><select class="inp"><option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option><option>IV</option></select></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">'
    +'<div><label class="lbl">Age <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label><input class="inp" type="number" min="1" max="99" placeholder="21"></div>'
    +'<div><label class="lbl">Gender <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label><select class="inp"><option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select></div>'
    +'</div>'
    +'<div><label class="lbl">Phone Number <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label>'
    +'<div style="display:flex;">'
    +'<span style="display:flex;align-items:center;padding:0 12px;background:rgba(51,65,85,.6);border:1px solid #334155;border-right:none;border-radius:8px 0 0 8px;color:#94a3b8;font-size:13px;flex-shrink:0;">+</span>'
    +'<input class="inp" type="tel" placeholder="63 912 345 6789" style="border-radius:0 8px 8px 0;">'
    +'</div></div>'
    +'</div>'
    // Right: request details
    +'<div>'
    +sectionLabel("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2","Request Details")
    // Resource select
    +'<div style="margin-bottom:12px;">'
    +'<label class="lbl">Resource Selection <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label>'
    +'<select class="inp" onchange="selectRes(this.value)"><option value="">Select a resource…</option>'+resOptions+'</select>'
    +sensPill+'</div>'
    // Permission type
    +'<div style="margin-bottom:12px;">'
    +'<label class="lbl">Permission Type <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label>'
    +'<select class="inp"><option value="">Select permission type…</option><option>View Only (Read)</option><option>Standard Use (Read / Write)</option><option>Administrative (Full Access)</option><option>Temporary Emergency Access</option></select>'
    +'<div style="font-size:11px;color:#475569;margin-top:4px;">Least Privilege: request only the minimum access you need.</div>'
    +'</div>'
    // Duration
    +'<div style="margin-bottom:12px;">'
    +'<label class="lbl">Access Duration <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label>'
    +'<select class="inp"><option value="">Select duration…</option><option>1 Day</option><option>3 Days</option><option>1 Week</option><option>2 Weeks</option><option>1 Month</option><option>1 Semester</option><option>1 Academic Year</option></select>'
    +'</div>'
    // Request form type
    +'<div style="margin-bottom:12px;">'
    +'<label class="lbl">Request Form Type <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label>'
    +'<input class="inp" type="text" placeholder="e.g. Lab Access, Research Clearance, Facility Entry…">'
    +'</div>'
    // Justification
    +'<div>'
    +'<label class="lbl">Access Justification <span style="color:#f87171;font-weight:400;text-transform:none;">*</span></label>'
    +'<textarea class="inp" rows="4" placeholder="Describe the purpose of your request — the resource, why you need it, and the intended use…" style="resize:none;"></textarea>'
    +'</div>'
    +'</div>'
    // Terms — full width
    +'<div style="grid-column:1/-1;">'
    +'<div style="background:rgba(30,41,59,.5);border:1px solid rgba(51,65,85,.6);border-radius:12px;padding:20px;">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'
    +'<div style="width:24px;height:24px;border-radius:6px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);display:flex;align-items:center;justify-content:center;color:#fbbf24;">'
    +svgIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",14)
    +'</div>'
    +'<span style="font-size:11px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:.1em;">Terms &amp; Agreement</span>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">'
    +'<div style="font-size:12px;color:#64748b;line-height:1.7;">'
    +'<div style="font-weight:500;color:#94a3b8;margin-bottom:6px;">By submitting this form, I agree that:</div>'
    +'<div>1. All information provided is accurate and complete.</div>'
    +'<div>2. False information may result in denial and disciplinary action.</div>'
    +'<div>3. Approved access is used only for the stated purpose.</div>'
    +'</div>'
    +'<div style="font-size:12px;color:#64748b;line-height:1.7;">'
    +'<div style="font-weight:500;color:#94a3b8;margin-bottom:6px;">I also acknowledge that:</div>'
    +'<div>4. I will comply with all university security policies.</div>'
    +'<div>5. Access may be revoked at any time if policies are violated.</div>'
    +'<div>6. My personal data is processed per the university privacy policy.</div>'
    +'</div>'
    +'</div>'
    +'<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;" onclick="toggleAgreed()">'
    +'<div '+cbStyle+'>'+( state.agreed ? svgIcon("M5 13l4 4L19 7",12) : "" )+'</div>'
    +'<span style="font-size:13px;color:#cbd5e1;line-height:1.6;">'
    +'I have read and agree to the <span style="color:#818cf8;text-decoration:underline;">Terms and Conditions</span> and <span style="color:#818cf8;text-decoration:underline;">Privacy Policy</span> of the Student Access Permission Management System.</span>'
    +'</label>'
    +'</div></div>'
    +'</div></div>'
    // Footer
    +'<div class="modal-footer">'
    +'<div style="font-size:12px;color:#475569;display:flex;align-items:center;gap:8px;">'
    +'<span style="color:#f87171;">*</span> Required fields'
    +(!state.agreed ? '<span style="color:rgba(251,191,36,.8);margin-left:8px;display:flex;align-items:center;gap:4px;">'+svgIcon("M12 9v2m0 4h.01",14)+' Accept the terms to enable submission</span>' : "")
    +'</div>'
    +'<div style="display:flex;gap:12px;">'
    +'<button onclick="closeModal()" class="btn btn-ghost" style="border-radius:12px;">Cancel</button>'
    +btnHtml
    +'</div>'
    +'</div>'
    +'</div></div>';
}

function selectRes(id) { state.selectedRes = id; render(); }
function toggleAgreed() { state.agreed = !state.agreed; render(); }
function submitRequest() {
  if (!state.agreed) return;
  state.submitted = true;
  render();
  setTimeout(function(){ closeModal(); }, 1800);
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────

function renderHistory() {
  var statuses = ["All","Approved","Under Review","Rejected"];
  var filtered = state.histFilter === "All" ? allRequests
    : allRequests.filter(function(r){ return r.status === state.histFilter; });

  var tabs = statuses.map(function(s){
    return '<button class="filter-btn'+(state.histFilter===s?" active":"")+'" onclick="setHistFilter(\''+s+'\')">'+s+'</button>';
  }).join("");

  var items = filtered.map(function(r){
    var cls = r.status==="Approved"?"approved":r.status==="Rejected"?"rejected":"review";
    var icon = r.status==="Approved"
      ? svgIcon("M5 13l4 4L19 7",20)
      : r.status==="Rejected"
        ? svgIcon("M6 18L18 6M6 6l12 12",20)
        : svgIcon("M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",20);
    return '<div class="hist-item">'
      +'<div class="hist-icon '+cls+'">'+icon+'</div>'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
      +'<span style="font-size:14px;font-weight:600;color:#fff;">'+h(r.resource)+'</span>'+badge(r.status)
      +'</div>'
      +'<div style="font-size:11px;color:#475569;margin-top:2px;">'+h(r.id)+' \xb7 '+h(r.permType)+' \xb7 '+h(r.level)+' \xb7 '+h(r.duration)+'</div>'
      +'<div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.6;">'+h(r.justification)+'</div>'
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0;">'
      +'<div style="font-size:12px;color:#94a3b8;">'+h(r.submitted)+'</div>'
      +'<div style="font-size:11px;color:#475569;margin-top:4px;">Reviewer: '+h(r.reviewer)+'</div>'
      +'</div>'
      +'</div>';
  }).join("");

  return '<div class="space-y">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Request History</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Full history of all submitted access permission requests</div></div>'
    +'<div style="display:flex;gap:8px;">'+tabs+'</div>'
    +'<div class="space-y-sm">'+items+'</div>'
    +'</div>';
}
function setHistFilter(f) { state.histFilter=f; render(); }

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────

function renderNotifications() {
  var typeIcon = {
    approval:  svgIcon("M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"),
    rejection: svgIcon("M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"),
    expiring:  svgIcon("M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"),
    security:  svgIcon("M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"),
    system:    svgIcon("M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"),
  };
  var typeColor = {
    approval:"rgba(16,185,129,.15);color:#34d399",
    rejection:"rgba(239,68,68,.15);color:#f87171",
    expiring:"rgba(249,115,22,.15);color:#fb923c",
    security:"rgba(239,68,68,.15);color:#f87171",
    system:"rgba(99,102,241,.15);color:#818cf8",
  };

  var unreadN = state.notifications.filter(function(n){ return !n.read; });
  var readN   = state.notifications.filter(function(n){ return n.read; });

  function renderN(n) {
    var col = typeColor[n.type] || "rgba(51,65,85,.5);color:#94a3b8";
    return '<div class="notif-item'+(n.read?" read":"")+'" '+(n.read?"":'onclick="markRead(\''+n.id+'\')"')+'>'
      +'<div class="notif-icon" style="background:'+col.split(";")[0]+';color:'+col.split("color:")[1]+';">'+(typeIcon[n.type]||"")+'</div>'
      +'<div style="flex:1;">'
      +'<div style="font-size:13px;font-weight:'+(n.read?"500":"600")+';color:'+(n.read?"#94a3b8":"#fff")+';">'+h(n.title)+'</div>'
      +'<div style="font-size:12px;color:'+(n.read?"#475569":"#94a3b8")+';margin-top:2px;line-height:1.6;">'+h(n.message)+'</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">'
      +'<div style="font-size:11px;color:#475569;">'+h(n.time)+'</div>'
      +(!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:#818cf8;"></div>' : "")
      +'</div>'
      +'</div>';
  }

  return '<div class="space-y">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Notifications</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Status updates, approvals, and system alerts</div></div>'
    +(unreadN.length>0?'<button onclick="markAllRead()" style="font-size:13px;color:#818cf8;background:none;border:none;cursor:pointer;">Mark all as read</button>':"")
    +'</div>'
    +(unreadN.length>0
      ? '<div><div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Unread ('+unreadN.length+')</div>'
        +'<div class="space-y-sm">'+unreadN.map(renderN).join("")+'</div></div>'
      : "")
    +(readN.length>0
      ? '<div><div style="font-size:11px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Earlier</div>'
        +'<div class="space-y-sm">'+readN.map(renderN).join("")+'</div></div>'
      : "")
    +'</div>';
}
function markRead(id) {
  state.notifications = state.notifications.map(function(n){ return n.id===id ? Object.assign({},n,{read:true}) : n; });
  render();
}
function markAllRead() {
  state.notifications = state.notifications.map(function(n){ return Object.assign({},n,{read:true}); });
  render();
}

// ─── MONITORING ───────────────────────────────────────────────────────────────

function renderMonitoring() {
  var statCols = [
    { label:"Active Grants",      value:state.accesses.filter(function(a){return a.status!=="Revoked";}).length,         color:"#34d399" },
    { label:"Expiring Soon",      value:state.accesses.filter(function(a){return a.status==="Expiring Soon";}).length,   color:"#fb923c" },
    { label:"Least Privilege",    value:state.accesses.filter(function(a){return a.lp;}).length,                         color:"#818cf8" },
    { label:"Protected Resources",value:state.accesses.filter(function(a){return a.sensitivity!=="Standard";}).length,  color:"#a78bfa" },
  ];

  var cards = state.accesses.map(function(a){
    var revoked = a.status === "Revoked";
    var expiringCard = a.status === "Expiring Soon";
    var cls = revoked ? "mon-card revoked" : expiringCard ? "mon-card expiring" : "mon-card";
    var pct = Math.round(Math.min(a.daysLeft / 180 * 100, 100));
    var barColor = a.daysLeft <= 10 ? "#fb923c" : "#34d399";
    var daysColor = a.daysLeft <= 10 ? "#fb923c" : "#34d399";

    return '<div class="'+cls+'">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;">'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">'
      +'<span style="font-size:14px;font-weight:600;color:#fff;">'+h(a.resource)+'</span>'
      +((a.sensitivity!=="Standard")
        ? '<span style="color:#fbbf24;">'+svgIcon("M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",14)+'</span>'
        : "")
      +'</div>'
      +pip(a.sensitivity)
      +'</div>'
      +badge(a.status)
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">'
      +'<div><div style="font-size:11px;color:#475569;">Permission</div><div style="font-size:13px;color:#cbd5e1;font-weight:500;margin-top:2px;">'+h(a.type)+'</div></div>'
      +'<div><div style="font-size:11px;color:#475569;">Granted</div><div style="font-size:13px;color:#cbd5e1;font-weight:500;margin-top:2px;">'+h(a.granted)+'</div></div>'
      +'<div><div style="font-size:11px;color:#475569;">Expires</div><div style="font-size:13px;font-weight:500;margin-top:2px;color:'+daysColor+';">'+h(a.expires)+'</div></div>'
      +'<div><div style="font-size:11px;color:#475569;">Days Remaining</div><div style="font-size:20px;font-weight:800;margin-top:2px;color:'+daysColor+';">'+(revoked?"&mdash;":a.daysLeft)+'</div></div>'
      +'</div>'
      +'<div class="exp-bar-wrap" style="margin-bottom:12px;"><div class="exp-bar" style="width:'+pct+'%;background:'+barColor+';"></div></div>'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(51,65,85,.4);">'
      +'<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#818cf8;">'
      +svgIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",14)
      +'Least Privilege Verified</div>'
      +(!revoked
        ? '<button onclick="openRevoke(\''+a.id+'\')" style="font-size:12px;color:#f87171;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;">'
          +svgIcon("M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",14)
          +'Revoke Access</button>'
        : "")
      +'</div>'
      +'</div>';
  }).join("");

  return '<div class="space-y">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Access Monitoring</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Real-time view of active grants, expiration tracking, and least privilege status</div></div>'
    +'<div class="grid-4">'
    +statCols.map(function(s){
      return '<div class="stat-card">'
        +'<div style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">'+s.label+'</div>'
        +'<div style="font-size:32px;font-weight:800;color:'+s.color+';margin-top:4px;">'+s.value+'</div>'
        +'</div>';
    }).join("")+'</div>'
    +'<div class="least-priv-bar">'
    +'<div style="color:#818cf8;flex-shrink:0;">'+svgIcon("M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",20)+'</div>'
    +'<div><div style="font-size:13px;font-weight:600;color:#a5b4fc;">Least Privilege Policy Active</div>'
    +'<div style="font-size:12px;color:rgba(165,180,252,.7);margin-top:2px;">All your active grants have been verified to use the minimum required access level for your stated purpose.</div>'
    +'</div></div>'
    +'<div class="grid-2">'+cards+'</div>'
    +'</div>';
}

function openRevoke(id) { state.revokeId = id; render(); }
function closeRevoke()  { state.revokeId = null; render(); }
function confirmRevoke(id) {
  state.accesses = state.accesses.map(function(a){ return a.id===id ? Object.assign({},a,{status:"Revoked"}) : a; });
  state.revokeId = null;
  render();
}

function renderRevokeModal() {
  var a = state.accesses.find(function(a){ return a.id === state.revokeId; });
  return '<div class="overlay" onclick="if(event.target===this)closeRevoke()">'
    +'<div class="modal revoke-modal" style="max-width:360px;">'
    +'<div style="padding:24px;text-align:center;">'
    +'<div style="width:48px;height:48px;border-radius:12px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);display:flex;align-items:center;justify-content:center;color:#f87171;margin:0 auto 16px;">'
    +svgIcon("M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",24)
    +'</div>'
    +'<div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;">Revoke Access</div>'
    +'<div style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:20px;">This will immediately revoke your access to <strong style="color:#fff;">'+(a?h(a.resource):"")+'</strong>. This action cannot be undone without a new request.</div>'
    +'<div style="display:flex;gap:12px;">'
    +'<button onclick="closeRevoke()" class="btn btn-ghost" style="flex:1;justify-content:center;border-radius:12px;">Cancel</button>'
    +'<button onclick="confirmRevoke(\''+state.revokeId+'\')" class="btn btn-danger" style="flex:1;justify-content:center;border-radius:12px;">Revoke</button>'
    +'</div>'
    +'</div></div></div>';
}

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

function renderAuditLogs() {
  var cats = ["All","Authentication","Access Request","Access Control","Access Grant"];
  var filtered = state.auditFilter==="All" ? auditLogs
    : auditLogs.filter(function(l){ return l.category===state.auditFilter; });

  var tabs = cats.map(function(c){
    return '<button class="filter-btn'+(state.auditFilter===c?" active":"")+'" onclick="setAuditFilter(\''+c+'\')">'+c+'</button>';
  }).join("");

  var rows = filtered.map(function(l, i){
    var stripe = i%2!==0?' style="background:rgba(30,41,59,.3)"':"";
    return '<tr class="hover-row" style="border-bottom:1px solid rgba(51,65,85,.3);"'+stripe+'>'
      +'<td style="padding:14px 20px;" class="mono"><span style="font-size:11px;font-family:\'JetBrains Mono\',monospace;color:#475569;white-space:nowrap;">'+h(l.timestamp)+'</span></td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#e2e8f0;white-space:nowrap;">'+h(l.action)+'</td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#cbd5e1;">'+h(l.resource)+'</td>'
      +'<td style="padding:14px 20px;">'+catTag(l.category)+'</td>'
      +'<td style="padding:14px 20px;">'+badge(l.result)+'</td>'
      +'<td style="padding:14px 20px;" class="mono"><span style="font-size:11px;font-family:\'JetBrains Mono\',monospace;color:#475569;">'+h(l.ip)+'</span></td>'
      +'<td style="padding:14px 20px;font-size:13px;color:#94a3b8;">'+h(l.actor)+'</td>'
      +'</tr>';
  }).join("");

  return '<div class="space-y">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Audit Logs</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Immutable record of all security-relevant actions on your account</div></div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;">'+tabs+'</div>'
    +'<div class="card" style="overflow:hidden;">'
    +'<table class="tbl"><thead><tr>'
    +["Timestamp","Action","Resource","Category","Result","IP Address","Actor"].map(function(hh){
      return '<th>'+hh+'</th>';
    }).join("")
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>';
}
function setAuditFilter(f) { state.auditFilter=f; render(); }

// ─── GRADES ───────────────────────────────────────────────────────────────────

function renderGrades() {
  var totalUnits = gradesData.reduce(function(s,g){ return s+g.units; }, 0);
  var gpa = (gradesData.reduce(function(s,g){ return s+g.points*g.units; }, 0) / totalUnits).toFixed(2);

  var statCols = [
    { label:"GPA",        value:gpa,             sub:"out of 4.0",     color:"#34d399" },
    { label:"Total Units",value:totalUnits,       sub:"enrolled",       color:"#818cf8" },
    { label:"Subjects",   value:gradesData.length,sub:"this semester",  color:"#a78bfa" },
  ];

  var rows = gradesData.map(function(g,i){
    var stripe = i%2!==0?' style="background:rgba(30,41,59,.3)"':"";
    return '<tr class="hover-row" style="border-bottom:1px solid rgba(51,65,85,.3);"'+stripe+'>'
      +'<td style="padding:16px 24px;" class="mono"><span style="font-size:13px;font-family:\'JetBrains Mono\',monospace;color:#818cf8;">'+h(g.code)+'</span></td>'
      +'<td style="padding:16px 24px;font-size:13px;color:#e2e8f0;">'+h(g.subject)+'</td>'
      +'<td style="padding:16px 24px;font-size:13px;color:#cbd5e1;text-align:center;">'+g.units+'</td>'
      +'<td style="padding:16px 24px;font-size:14px;font-weight:700;color:#fff;text-align:center;">'+h(g.grade)+'</td>'
      +'<td style="padding:16px 24px;font-size:13px;color:#cbd5e1;text-align:center;">'+g.points.toFixed(1)+'</td>'
      +'<td style="padding:16px 24px;">'+badge(g.status)+'</td>'
      +'</tr>';
  }).join("");

  return '<div class="space-y">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Academic Grades</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Current semester academic performance</div></div>'
    +'<button class="btn btn-primary">'+svgIcon("M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4")+'Export Transcript</button>'
    +'</div>'
    +'<div class="grid-3">'
    +statCols.map(function(s){
      return '<div class="stat-card">'
        +'<div style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">'+s.label+'</div>'
        +'<div style="font-size:32px;font-weight:800;color:'+s.color+';margin-top:4px;">'+s.value+'</div>'
        +'<div style="font-size:11px;color:#475569;margin-top:4px;">'+s.sub+'</div>'
        +'</div>';
    }).join("")+'</div>'
    +'<div class="card" style="overflow:hidden;"><table class="tbl">'
    +'<thead><tr>'
    +["Code","Subject","Units","Grade","Points","Status"].map(function(hh){return '<th>'+hh+'</th>';}).join("")
    +'</tr></thead><tbody>'+rows+'</tbody></table></div>'
    +'</div>';
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

function renderDocuments() {
  var q = state.docSearch.toLowerCase();
  var filtered = documentsData.filter(function(d){
    return d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q);
  });

  var docTypeColor = {
    Security:     "rgba(239,68,68,.15);text:f87171",
    Academic:     "rgba(99,102,241,.15);text:818cf8",
    Identification:"rgba(51,65,85,.6);text:94a3b8",
  };

  var items = filtered.map(function(doc){
    var c = docTypeColor[doc.type] || "rgba(51,65,85,.6);text:94a3b8";
    var bg = c.split(";")[0];
    var tc = "#" + c.split("text:")[1];
    return '<div class="card card-p" style="display:flex;align-items:center;gap:16px;transition:border-color .15s;cursor:pointer;" onmouseover="this.style.borderColor=\'rgba(99,102,241,.4)\'" onmouseout="this.style.borderColor=\'rgba(51,65,85,.5)\'">'
      +'<div style="width:40px;height:40px;border-radius:10px;background:'+bg+';color:'+tc+';display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
      +svgIcon("M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",20)
      +'</div>'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="display:flex;align-items:center;gap:8px;">'
      +'<span style="font-size:13px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+h(doc.name)+'</span>'+badge(doc.status)
      +'</div>'
      +'<div style="font-size:11px;color:#475569;margin-top:2px;">'+h(doc.id)+' \xb7 '+h(doc.type)+' \xb7 '+h(doc.size)+'</div>'
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0;">'
      +'<div style="font-size:11px;color:#94a3b8;">Issued: <span style="color:#cbd5e1;">'+h(doc.issued)+'</span></div>'
      +'<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Expiry: <span style="color:#cbd5e1;">'+h(doc.expiry)+'</span></div>'
      +'</div>'
      +'<div style="display:flex;gap:4px;">'
      +'<button style="padding:8px;border-radius:8px;background:transparent;border:none;color:#475569;cursor:pointer;transition:background .15s;" onmouseover="this.style.background=\'#1e293b\'" onmouseout="this.style.background=\'transparent\'">'+svgIcon("M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",16)+'</button>'
      +'<button style="padding:8px;border-radius:8px;background:transparent;border:none;color:#475569;cursor:pointer;transition:background .15s;" onmouseover="this.style.background=\'#1e293b\'" onmouseout="this.style.background=\'transparent\'">'+svgIcon("M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",16)+'</button>'
      +'</div>'
      +'</div>';
  }).join("");

  return '<div class="space-y">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Document Repository</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Official documents and authorizations</div></div>'
    +'<button class="btn btn-primary">'+svgIcon("M12 4v16m8-8H4")+'Upload Document</button>'
    +'</div>'
    +'<div style="position:relative;">'
    +'<div style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#475569;pointer-events:none;">'
    +svgIcon("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",16)+'</div>'
    +'<input class="inp" type="text" placeholder="Search documents…" value="'+h(state.docSearch)+'" oninput="searchDocs(this.value)" style="padding-left:38px;">'
    +'</div>'
    +'<div class="space-y-sm">'+items+'</div>'
    +'</div>';
}
function searchDocs(v) { state.docSearch=v; render(); }

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function renderSettings() {
  var sections = [
    { title:"Personal Information", fields:[
      { label:"Full Name",     value:student.name },
      { label:"Student ID",    value:student.id,    disabled:true },
      { label:"Email Address", value:student.email },
      { label:"Phone Number",  value:student.phone },
    ]},
    { title:"Security Settings", fields:[
      { label:"Current Password", value:"••••••••••••", type:"password" },
      { label:"New Password",     value:"", type:"password", placeholder:"Enter new password" },
      { label:"Confirm Password", value:"", type:"password", placeholder:"Confirm new password" },
    ]},
  ];

  return '<div class="space-y">'
    +'<div><div style="font-size:24px;font-weight:800;color:#fff;">Account Settings</div>'
    +'<div style="font-size:13px;color:#94a3b8;margin-top:4px;">Manage your profile and security preferences</div></div>'
    +sections.map(function(sec){
      var fields = sec.fields.map(function(f){
        return '<div>'
          +'<label style="display:block;font-size:12px;font-weight:500;color:#475569;margin-bottom:6px;">'+h(f.label)+'</label>'
          +'<input type="'+(f.type||"text")+'" value="'+h(f.value)+'" '+(f.disabled?"disabled":"")+' placeholder="'+h(f.placeholder||"")+'" class="inp" '+(f.disabled?'style="opacity:.5;cursor:not-allowed;"':"")+' />'
          +'</div>';
      }).join("");
      return '<div class="card card-p">'
        +'<div style="font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;">'+h(sec.title)+'</div>'
        +'<div class="grid-2">'+fields+'</div>'
        +'<div style="display:flex;justify-content:flex-end;margin-top:16px;">'
        +'<button class="btn btn-primary" style="font-size:13px;">Save Changes</button>'
        +'</div></div>';
    }).join("")
    +'</div>';
}

// ─── BIND GLOBAL ─────────────────────────────────────────────────────────────

function bindGlobal() {
  // Expose all interactive functions to global scope (already on window by default in non-module JS)
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────

render();
