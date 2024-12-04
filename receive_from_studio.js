// Learn more about source functions API at
// https://segment.com/docs/connections/sources/source-functions

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */

async function onRequest(request, settings) {
  const body = request.json();

  // See https://segment.com/docs/connections/spec/track/
  Segment.track({
    event: body.event,
    userId: body.userId,
  });
}
