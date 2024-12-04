/**
 * @param {SpecTrack} event The track event
 * @param {Object.<string, any>} settings Custom settings
 * @return void
 */

/**
 * Sample Input Payload:
{
  "type": "track",
  "event": "send_flow",
  "userId": "<your users ID>",
  "properties": {
    "phoneNumber": "<your users phone>",
    "name": "Alex",
    "goal": "Hold my breath for 2 min",
    "class": "Underwater Yoga"
  }
}
 */

async function onTrack(event, settings) {
  const Body = "Hello, World!";
  const To = event.properties.phoneNumber;

  if (settings.twilioFrom) {
    if (event.event == "send_text") {
      await sendText(
        {
          From: settings.twilioFrom,
          To,
          Body,
        },
        settings
      );
    }

    if (event.event == "send_phone") {
      await phoneCall(
        {
          From: settings.twilioFrom,
          To,
          // Learn more at: https://www.twilio.com/docs/voice/twiml
          Twiml: `
					<Response>
						<Break strength="x-weak" time="1000ms"/>
						<Say>${Body}</Say>
					</Response>
				`,
        },
        settings
      );
    }

    if (event.event == "send_flow" && settings.studioFlowId) {
      event.properties.userId = event.userId;
      await studioFlow(
        {
          From: settings.twilioFrom,
          To,
          Parameters: toStudioParams(event.properties),
        },
        settings
      );
    } else {
      console.error("No Flow ID set");
    }
  }

  if (settings.twilioWhatsAppFrom) {
    // Learn more at: https://www.twilio.com/docs/whatsapp
    await sendText(
      {
        To: "whatsapp:" + To,
        From: settings.twilioWhatsAppFrom,
        Body,
      },
      settings
    );
  }
}

/**
 * Sends SMS or WhatsApp message with Twilio
 *
 * https://www.twilio.com/docs/sms
 * https://www.twilio.com/docs/whatsapp
 *
 */
async function sendText(params, settings) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountId}/Messages.json`;
  await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(
        settings.twilioAccountId + ":" + settings.twilioToken
      )}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: toFormParams(params),
  });
}

/**
 * Places a Twilio phone call.
 *
 * https://www.twilio.com/docs/voice
 *
 */
async function phoneCall(params, settings) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountId}/Calls.json`;
  await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(
        settings.twilioAccountId + ":" + settings.twilioToken
      )}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: toFormParams(params),
  });
}

/**
 * Trigger a Twilio Studio Flow.
 *
 * https://www.twilio.com/docs/studio
 *
 */
async function studioFlow(params, settings) {
  console.log(params);
  console.log(toFormParams(params));
  const endpoint = `https://studio.twilio.com/v2/Flows/${settings.studioFlowId}/Executions`;
  await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(
        settings.twilioAccountId + ":" + settings.twilioToken
      )}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: toFormParams(params),
  });
}

function toFormParams(params) {
  return Object.entries(params)
    .map(([key, value]) => {
      const paramName = encodeURIComponent(key);
      const param = encodeURIComponent(value);
      return `${paramName}=${param}`;
    })
    .join("&");
}

function toStudioParams(params) {
  const paramsStr = Object.entries(params)
    .map(([key, value]) => {
      const paramName = encodeURIComponent(key);
      const param = encodeURIComponent(value);
      return `"${paramName}":"${param}"`;
    })
    .join(",");
  return `{${paramsStr}}`;
}
