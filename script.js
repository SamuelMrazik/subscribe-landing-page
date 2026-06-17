const subscribeForm = document.getElementById("subscribe-form");
const emailInput = document.getElementById("email");
const subscribeMessage = document.getElementById("subscribe-message");

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function generateEventId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getTrackingContext(email) {
  return {
    email,
    clientUserAgent: navigator.userAgent,
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc"),
  };
}

async function sendCapiEvents(events, context) {
  const response = await fetch("/api/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      events,
      ...context,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "CAPI request failed");
  }

  return response.json();
}

function trackBrowserEvent(eventName, eventId, customData = {}) {
  if (typeof fbq === "undefined") {
    return;
  }

  fbq("track", eventName, customData, { eventID: eventId });
}

function trackViewContent() {
  const eventId = generateEventId();
  const eventTime = Math.floor(Date.now() / 1000);
  const eventSourceUrl = window.location.href;

  trackBrowserEvent("ViewContent", eventId);

  sendCapiEvents(
    [
      {
        event_name: "ViewContent",
        event_time: eventTime,
        event_id: eventId,
        event_source_url: eventSourceUrl,
      },
    ],
    getTrackingContext()
  ).catch((error) => {
    console.warn("ViewContent CAPI error:", error.message);
  });
}

function showMessage(text, isError = false) {
  subscribeMessage.textContent = text;
  subscribeMessage.hidden = false;
  subscribeMessage.classList.toggle("subscribe-message--error", isError);
}

subscribeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    showMessage("Please enter your email.", true);
    return;
  }

  const context = getTrackingContext(email);
  const eventTime = Math.floor(Date.now() / 1000);
  const eventSourceUrl = window.location.href;
  const leadEventId = generateEventId();
  const registrationEventId = generateEventId();

  trackBrowserEvent("Lead", leadEventId);
  trackBrowserEvent("CompleteRegistration", registrationEventId);

  try {
    await sendCapiEvents(
      [
        {
          event_name: "Lead",
          event_time: eventTime,
          event_id: leadEventId,
          event_source_url: eventSourceUrl,
        },
        {
          event_name: "CompleteRegistration",
          event_time: eventTime,
          event_id: registrationEventId,
          event_source_url: eventSourceUrl,
        },
      ],
      context
    );

    showMessage("Thanks for subscribing!");
    subscribeForm.reset();
  } catch (error) {
    console.error("Subscribe CAPI error:", error);
    showMessage("Something went wrong. Please try again.", true);
  }
});

trackViewContent();
