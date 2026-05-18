const HIGH_ROUTES = {
  170: ["T20", "T20", "Bull"], 167: ["T20", "T19", "Bull"], 164: ["T20", "T18", "Bull"], 161: ["T20", "T17", "Bull"],
  160: ["T20", "T20", "D20"], 158: ["T20", "T20", "D19"], 157: ["T20", "T19", "D20"], 156: ["T20", "T20", "D18"],
  155: ["T20", "T19", "D19"], 154: ["T20", "T18", "D20"], 153: ["T20", "T19", "D18"], 152: ["T20", "T20", "D16"],
  151: ["T20", "T17", "D20"], 150: ["T20", "T18", "D18"], 149: ["T20", "T19", "D16"], 148: ["T20", "T20", "D14"],
  147: ["T20", "T17", "D18"], 146: ["T20", "T18", "D16"], 145: ["T20", "T15", "D20"], 144: ["T20", "T20", "D12"],
  143: ["T20", "T17", "D16"], 142: ["T20", "T14", "D20"], 141: ["T20", "T19", "D12"], 140: ["T20", "T20", "D10"],
  139: ["T19", "T14", "D20"], 138: ["T20", "T18", "D12"], 137: ["T20", "T19", "D10"], 136: ["T20", "T20", "D8"],
  135: ["Bull", "T15", "D20"], 134: ["T20", "T14", "D16"], 133: ["T20", "T19", "D8"], 132: ["Bull", "T14", "D20"],
  131: ["T20", "T13", "D16"], 130: ["T20", "T20", "D5"], 129: ["T19", "T16", "D12"], 128: ["T18", "T14", "D16"],
  127: ["T20", "T17", "D8"], 126: ["T19", "T19", "D6"], 125: ["25", "T20", "D20"], 124: ["T20", "T16", "D8"],
  123: ["T19", "T16", "D9"], 122: ["T18", "T18", "D7"], 121: ["T20", "T11", "D14"], 120: ["T20", "20", "D20"],
  119: ["T19", "T12", "D13"], 118: ["T20", "18", "D20"], 117: ["T20", "17", "D20"], 116: ["T20", "16", "D20"],
  115: ["T20", "15", "D20"], 114: ["T20", "14", "D20"], 113: ["T20", "13", "D20"], 112: ["T20", "12", "D20"],
  111: ["T20", "11", "D20"], 110: ["T20", "10", "D20"], 109: ["T20", "9", "D20"], 108: ["T20", "16", "D16"],
  107: ["T19", "10", "D20"], 106: ["T20", "10", "D18"], 105: ["T20", "13", "D16"], 104: ["T18", "18", "D16"],
  103: ["T19", "10", "D18"], 102: ["T20", "10", "D16"], 101: ["T17", "10", "D20"], 100: ["T20", "D20"],
};

const valueOf = (hit) => {
  if (hit === "Bull") return 50;
  if (hit === "25") return 25;
  const m = hit.match(/^([TDS])(\d{1,2})$/);
  if (!m) return parseInt(hit, 10);
  const [, prefix, nRaw] = m;
  const n = parseInt(nRaw, 10);
  const mult = prefix === "T" ? 3 : prefix === "D" ? 2 : 1;
  return n * mult;
};

const doubleFor = (n) => (n === 50 ? "Bull" : `D${n / 2}`);

function buildLowRoute(score) {
  if (score === 50) return ["Bull"];
  if (score <= 40 && score % 2 === 0) return [`D${score / 2}`];
  if (score < 60) {
    const setup = score - (score % 2 === 0 ? 40 : 32);
    const left = score - setup;
    return setup > 0 ? [`${setup}`, `D${left / 2}`] : [`D${score / 2}`];
  }
  const first = score - 40;
  return [`${first}`, "D20"];
}

function routeFor(score) {
  if ([159, 162, 163, 165, 166, 168, 169].includes(score)) return null;
  if (HIGH_ROUTES[score]) return HIGH_ROUTES[score];
  return buildLowRoute(score);
}

const allCards = [];
for (let score = 170; score >= 2; score--) {
  const route = routeFor(score);
  if (route) allCards.push({ score, route });
}

let deck = [...allCards];
let current = null;
let revealed = false;
let seen = new Set();
let correct = 0;
let total = 0;

const el = (id) => document.getElementById(id);

function applyRange() {
  const mode = el("rangeSelect").value;
  deck = allCards.filter(({ score }) => {
    if (mode === "pro") return score >= 60;
    if (mode === "big") return score >= 100;
    if (mode === "doubles") return score <= 40;
    return true;
  });
  shuffleDeck();
  seen = new Set();
  el("statusSeen").textContent = "Seen: 0";
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function render() {
  const card = el("card");
  if (!current) return;
  el("target").textContent = current.score;
  card.classList.toggle("revealed", revealed);
  const routeHtml = current.route
    .map((hit, i) => {
      const hitValue = valueOf(hit);
      const left = current.route.slice(0, i + 1).reduce((s, h) => s - valueOf(h), current.score);
      return `<div class="throw-step">
        <div class="throw-label">Dart ${i + 1}</div>
        <div class="throw-main">${hit} <span style="color:#bababa;font-size:0.98rem;">(${hitValue})</span></div>
        <div class="left">${left === 0 ? "Checkout ✅" : `${left} left`}</div>
      </div>`;
    })
    .join("");
  el("route").innerHTML = routeHtml;
  el("statusLeft").textContent = `Cards left in range: ${deck.length}`;
}

function nextCard(preferUnseen = false) {
  if (deck.length === 0) applyRange();
  if (preferUnseen) {
    const unseen = deck.filter((c) => !seen.has(c.score));
    if (unseen.length) current = unseen[Math.floor(Math.random() * unseen.length)];
    else current = deck[Math.floor(Math.random() * deck.length)];
  } else {
    current = deck[Math.floor(Math.random() * deck.length)];
  }
  revealed = false;
  seen.add(current.score);
  el("statusSeen").textContent = `Seen: ${seen.size}`;
  render();
}

function mark(known) {
  total += 1;
  if (known) correct += 1;
  el("score").textContent = `${correct} / ${total}`;
  el("easyBtn").className = known ? "good" : "";
  el("hardBtn").className = !known ? "bad" : "";
  setTimeout(() => {
    el("easyBtn").className = "";
    el("hardBtn").className = "";
  }, 220);
  nextCard(true);
}

el("newBtn").addEventListener("click", () => nextCard(false));
el("easyBtn").addEventListener("click", () => mark(true));
el("hardBtn").addEventListener("click", () => mark(false));
el("shuffleBtn").addEventListener("click", () => { shuffleDeck(); nextCard(false); });
el("resetBtn").addEventListener("click", () => { correct = 0; total = 0; el("score").textContent = "0 / 0"; });
el("rangeSelect").addEventListener("change", applyRange);
el("nextAfterCorrect").addEventListener("click", () => nextCard(true));

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); flipCard(); }
  if (e.key.toLowerCase() === "n") nextCard(false);
  if (e.key === "1") mark(true);
  if (e.key === "2") mark(false);
});

applyRange();
nextCard(false);


function flipCard() { revealed = !revealed; render(); }

el("card").addEventListener("click", flipCard);
el("card").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    flipCard();
  }
});
