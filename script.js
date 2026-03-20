function logout() {
  localStorage.removeItem("gigshield_user");
  window.location.href = "./index.html";
}

window.onload = function () {
  const savedUser = localStorage.getItem("gigshield_user");
  const userEl = document.getElementById("welcomeUser");
  if (userEl) {
    userEl.textContent = savedUser || "Team Lead";
  }
};



function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * R * Math.asin(Math.sqrt(a));
}

function evaluateClaim() {
  const registeredLat = parseFloat(document.getElementById("registeredLat").value);
  const registeredLon = parseFloat(document.getElementById("registeredLon").value);
  const claimedLat = parseFloat(document.getElementById("claimedLat").value);
  const claimedLon = parseFloat(document.getElementById("claimedLon").value);

  const weather = parseInt(document.getElementById("weather").value);
  const gps = parseInt(document.getElementById("gps").value);
  const deliveryCount = parseInt(document.getElementById("deliveryCount").value);
  const hours = parseInt(document.getElementById("hours").value);
  const spoof = parseInt(document.getElementById("spoof").value);
  const integrity = parseInt(document.getElementById("integrity").value);
  const mass = parseInt(document.getElementById("mass").value);
  const speed = parseInt(document.getElementById("speed").value);

  const activeDelivery = document.getElementById("activeDelivery").checked;
  const networkDrop = document.getElementById("networkDrop").checked;

  const distance = haversineKm(registeredLat, registeredLon, claimedLat, claimedLon);

  let trust = 0;
  let fraud = 0;
  const reasons = [];

  if (weather >= 7) {
    trust += 20;
    reasons.push("Severe weather exists in claimed area.");
  } else if (weather >= 4) {
    trust += 10;
    reasons.push("Moderate disruption exists in claimed area.");
  } else {
    fraud += 15;
    reasons.push("No major disruption detected in claimed area.");
  }

  if (distance <= 3) {
    trust += 20;
    reasons.push("Claimed location is close to registered work zone.");
  } else if (distance <= 8) {
    trust += 8;
    reasons.push("Claimed location is moderately far from registered work zone.");
  } else {
    fraud += 25;
    reasons.push("Claimed location is too far from registered work zone.");
  }

  if (gps <= 20) {
    trust += 10;
    reasons.push("GPS accuracy is strong.");
  } else if (gps <= 60) {
    trust += 4;
    reasons.push("GPS accuracy is acceptable.");
  } else {
    fraud += 15;
    reasons.push("Poor GPS accuracy increases spoofing risk.");
  }

  if (activeDelivery) {
    trust += 20;
    reasons.push("Worker was active in delivery flow.");
  } else {
    fraud += 10;
    reasons.push("No current delivery activity detected.");
  }

  if (deliveryCount >= 3) {
    trust += 12;
    reasons.push("Recent delivery count supports genuine activity.");
  } else if (deliveryCount === 0) {
    fraud += 10;
    reasons.push("No recent deliveries detected before claim.");
  }

  if (hours <= 2) {
    trust += 10;
    reasons.push("Recent delivery timing appears realistic.");
  } else if (hours > 8) {
    fraud += 10;
    reasons.push("Long inactivity before claim is suspicious.");
  }

  if (networkDrop) {
    trust += 6;
    reasons.push("Possible genuine network instability during bad weather.");
  }

  if (spoof >= 8) {
    fraud += 30;
    reasons.push("High device spoofing risk detected.");
  } else if (spoof >= 5) {
    fraud += 15;
    reasons.push("Medium spoofing indicators detected.");
  } else {
    trust += 8;
    reasons.push("Low spoofing indicators from device behavior.");
  }

  if (integrity >= 8) {
    trust += 10;
    reasons.push("Device integrity score is strong.");
  } else if (integrity <= 4) {
    fraud += 18;
    reasons.push("Device integrity score is weak.");
  }

  if (mass >= 20) {
    fraud += 25;
    reasons.push("Mass claims from same zone suggest coordinated fraud risk.");
  } else if (mass >= 8) {
    fraud += 12;
    reasons.push("Elevated cluster claims detected in same zone.");
  }

  if (speed > 80) {
    fraud += 20;
    reasons.push("Unrealistic movement speed suggests spoofing.");
  } else if (speed > 50) {
    fraud += 8;
    reasons.push("Movement speed is somewhat unusual.");
  } else {
    trust += 5;
    reasons.push("Movement speed is within plausible range.");
  }

  const finalScore = trust - fraud;

  let decision = "";
  let action = "";
  let decisionClass = "neutral";

  if (fraud >= 55 || finalScore <= -20) {
    decision = "🚨 Likely Spoofed";
    action = "Hold payout, flag claim, and request secondary evidence.";
    decisionClass = "spoofed";
  } else if (fraud >= 30 || finalScore < 15) {
    decision = "⚠️ Manual Review";
    action = "Temporarily hold payout and verify with supporting checks.";
    decisionClass = "review";
  } else {
    decision = "✅ Trusted Claim";
    action = "Approve automated payout.";
    decisionClass = "trusted";
  }

  document.getElementById("distanceMetric").textContent = distance.toFixed(2) + " km";
  document.getElementById("trustMetric").textContent = trust;
  document.getElementById("fraudMetric").textContent = fraud;
  document.getElementById("finalMetric").textContent = finalScore;

  const banner = document.getElementById("decisionBanner");
  banner.className = "decision-banner " + decisionClass;
  banner.textContent = decision;

  document.getElementById("actionBox").textContent = "Action: " + action;

  const alertBox = document.getElementById("alertBox");
  if (mass > 15) {
    alertBox.classList.remove("hidden");
    alertBox.textContent = "🚨 ALERT: Possible Coordinated Fraud Ring Detected!";
  } else {
    alertBox.classList.add("hidden");
    alertBox.textContent = "";
  }

  const reasonsList = document.getElementById("reasonsList");
  reasonsList.innerHTML = "";
  reasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    reasonsList.appendChild(li);
  });
}

function setInput(id, value) {
  document.getElementById(id).value = value;
}

function loadTrustedCase() {
  setInput("weather", 8);
  setInput("gps", 18);
  setInput("deliveryCount", 4);
  setInput("hours", 1);
  setInput("spoof", 2);
  setInput("integrity", 8);
  setInput("mass", 3);
  setInput("speed", 22);

  document.getElementById("activeDelivery").checked = true;
  document.getElementById("networkDrop").checked = true;

  document.getElementById("registeredLat").value = 13.0827;
  document.getElementById("registeredLon").value = 80.2707;
  document.getElementById("claimedLat").value = 13.0674;
  document.getElementById("claimedLon").value = 80.2376;
}

function loadReviewCase() {
  setInput("weather", 5);
  setInput("gps", 55);
  setInput("deliveryCount", 1);
  setInput("hours", 6);
  setInput("spoof", 5);
  setInput("integrity", 5);
  setInput("mass", 10);
  setInput("speed", 55);

  document.getElementById("activeDelivery").checked = false;
  document.getElementById("networkDrop").checked = true;

  document.getElementById("registeredLat").value = 13.0827;
  document.getElementById("registeredLon").value = 80.2707;
  document.getElementById("claimedLat").value = 13.0450;
  document.getElementById("claimedLon").value = 80.2100;
}

function loadSpoofCase() {
  setInput("weather", 1);
  setInput("gps", 120);
  setInput("deliveryCount", 0);
  setInput("hours", 10);
  setInput("spoof", 9);
  setInput("integrity", 2);
  setInput("mass", 25);
  setInput("speed", 95);

  document.getElementById("activeDelivery").checked = false;
  document.getElementById("networkDrop").checked = false;

  document.getElementById("registeredLat").value = 13.0827;
  document.getElementById("registeredLon").value = 80.2707;
  document.getElementById("claimedLat").value = 12.9500;
  document.getElementById("claimedLon").value = 80.1000;
}