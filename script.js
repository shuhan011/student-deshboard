/* ===== JavaScript ===== */

// 1) Demo data (a real project would get this from a server)
const USERS = {
  "2024001": { pass:"student123", name:"Rahim Uddin", dept:"Computer Science", year:"3rd Year", email:"rahim@northfield.edu", phone:"01700-000000" }
};
const COURSES = [
  { code:"CSE-301", name:"Database Systems",   credit:3, progress:72, marks:84, grade:"A"  },
  { code:"CSE-305", name:"Web Technologies",   credit:3, progress:90, marks:91, grade:"A+" },
  { code:"MAT-210", name:"Linear Algebra",     credit:3, progress:55, marks:68, grade:"B"  },
  { code:"CSE-312", name:"Operating Systems",  credit:4, progress:64, marks:76, grade:"A-" }
];
const SCHEDULE = [
  { time:"09:00", title:"Database Systems", room:"Room 204" },
  { time:"11:30", title:"Web Technologies Lab", room:"Lab 3" },
  { time:"14:00", title:"Operating Systems", room:"Room 110" }
];
const NOTICES = [
  { title:"Mid-term exam routine published", when:"2 days ago", tag:"Exam" },
  { title:"Library closed this Saturday", when:"3 days ago", tag:"Library" },
  { title:"Web Technologies project submission", when:"Next Monday", tag:"Deadline" }
];

// Students added from the dashboard are saved in this browser
function loadExtra(){ try { return JSON.parse(localStorage.getItem("extraUsers")) || {}; } catch(e){ return {}; } }
function saveExtra(o){ try { localStorage.setItem("extraUsers", JSON.stringify(o)); } catch(e){} }
let EXTRA = loadExtra();
Object.assign(USERS, EXTRA);

// 2) Helpers
function esc(s){ const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
const $ = (id) => document.getElementById(id);
const store = {
  get(){ try { return sessionStorage.getItem("sid"); } catch(e){ return null; } },
  set(v){ try { sessionStorage.setItem("sid", v); } catch(e){} },
  clear(){ try { sessionStorage.removeItem("sid"); } catch(e){} }
};

// 3) Login
$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("sid").value.trim(), pw = $("pass").value;
  if (!id || !pw) return showError("Enter your student ID and password.");
  const u = USERS[id];
  if (!u || u.pass !== pw) return showError("ID or password is incorrect. Check them and try again.");
  showError(""); store.set(id); openDashboard(id);
});
function showError(m){ $("err").textContent = m; }

$("togglePw").addEventListener("click", () => {
  const p = $("pass"), show = p.type === "password";
  p.type = show ? "text" : "password";
  $("togglePw").textContent = show ? "Hide" : "Show";
});

// 4) Dashboard
function openDashboard(id){
  const u = USERS[id];
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");

  const first = u.name.split(" ")[0];
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  $("hello").textContent = greet + ", " + first;
  $("dateLine").textContent = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  $("avatar").textContent = u.name[0];
  $("whoName").textContent = u.name;
  $("whoDept").textContent = u.dept + " · " + u.year;

  // stats
  const credits = COURSES.reduce((s,c) => s + c.credit, 0);
  const stats = [["CGPA","3.62"],["Attendance","88%"],["Credits this term", credits],["Pending tasks","3"]];
  $("stats").innerHTML = stats.map(s => `<div class="card stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join("");

  $("schedule").innerHTML = SCHEDULE.map(c =>
    `<div class="row"><div><b>${c.title}</b><small>${c.room}</small></div><span class="tag">${c.time}</span></div>`).join("");

  $("notices").innerHTML = NOTICES.map(n =>
    `<div class="row"><div><b>${n.title}</b><small>${n.when}</small></div><span class="tag">${n.tag}</span></div>`).join("");

  $("courseList").innerHTML = COURSES.map(c =>
    `<div class="row"><div style="flex:1"><b>${c.code} · ${c.name}</b><small>${c.credit} credits · ${c.progress}% of syllabus covered</small>
     <div class="bar"><i style="width:${c.progress}%"></i></div></div></div>`).join("");

  $("resultBody").innerHTML = COURSES.map(c =>
    `<tr><td>${c.code} · ${c.name}</td><td>${c.credit}</td><td>${c.marks}</td><td><span class="tag">${c.grade}</span></td></tr>`).join("");

  $("profileInfo").innerHTML = [["Student ID", id],["Name", u.name],["Department", u.dept],["Year", u.year],["Email", u.email],["Phone", u.phone]]
    .map(r => `<div class="row"><small>${r[0]}</small><b>${esc(r[1])}</b></div>`).join("");
}

// 5) Tabs
document.querySelectorAll(".nav[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav[data-tab]").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("show"));
    btn.classList.add("active");
    $("tab-" + btn.dataset.tab).classList.add("show");
  });
});

// 6) Add student (on the login page, before signing in)
function addError(m){ $("addErr").textContent = m; }
function showRegister(show){
  $("loginBox").classList.toggle("hidden", show);
  $("regBox").classList.toggle("hidden", !show);
  addError(""); showError("");
  (show ? $("aid") : $("sid")).focus();
}
$("showAdd").addEventListener("click", () => { $("regOk").textContent = ""; showRegister(true); });
$("backToLogin").addEventListener("click", () => showRegister(false));

$("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("aid").value.trim(), name = $("aname").value.trim(), dept = $("adept").value.trim();
  const year = $("ayear").value, email = $("aemail").value.trim(), pass = $("apass").value;
  if (!id || !name || !dept || !email || !pass) return addError("Fill in every field.");
  if (!/^\d{4,10}$/.test(id)) return addError("Student ID must be 4 to 10 digits.");
  if (USERS[id]) return addError("This student ID already exists.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return addError("Enter a valid email address.");
  if (pass.length < 6) return addError("Password needs at least 6 characters.");
  const u = { pass, name, dept, year, email, phone:"Not added" };
  USERS[id] = u; EXTRA[id] = u; saveExtra(EXTRA);
  e.target.reset(); showRegister(false);
  $("sid").value = id;
  $("regOk").textContent = name + " was added. Enter the password to sign in.";
  $("pass").focus();
});

// 7) Logout & theme
$("logoutBtn").addEventListener("click", () => {
  store.clear();
  $("appView").classList.add("hidden");
  $("loginView").classList.remove("hidden");
  $("pass").value = "";
});
$("themeBtn").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
});

// 8) Stay signed in on refresh
const saved = store.get();
if (saved && USERS[saved]) openDashboard(saved);
