export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

// Resolve each axis separately so platform sides and undersides stay solid.
export function moveAndCollide(body, platforms, dt) {
  body.x += body.vx * dt;
  for (const platform of platforms) {
    if (!overlaps(body, platform)) continue;
    if (body.vx > 0) body.x = platform.x - body.width;
    else if (body.vx < 0) body.x = platform.x + platform.width;
    body.vx = 0;
  }

  const previousTop = body.y;
  const previousBottom = body.y + body.height;
  body.y += body.vy * dt;
  body.grounded = false;
  body.groundPlatform = null;
  let landing = null;
  let ceiling = null;
  for (const platform of platforms) {
    if (body.x + body.width <= platform.x || body.x >= platform.x + platform.width) continue;
    if (body.vy >= 0 && previousBottom <= platform.y && body.y + body.height >= platform.y) {
      if (!landing || platform.y < landing.y) landing = platform;
    } else if (body.vy < 0 && previousTop >= platform.y + platform.height
      && body.y <= platform.y + platform.height) {
      if (!ceiling || platform.y + platform.height > ceiling.y + ceiling.height) ceiling = platform;
    }
  }
  if (landing) {
    body.y = landing.y - body.height;
    body.vy = 0;
    body.grounded = true;
    body.groundPlatform = landing;
  } else if (ceiling) {
    body.y = ceiling.y + ceiling.height;
    body.vy = 0;
  }
}
