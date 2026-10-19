export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

// Resolve one axis at a time so touching a platform edge does not become a landing.
export function moveAndCollide(body, platforms, dt) {
  body.x += body.vx * dt;
  for (const platform of platforms) {
    if (!overlaps(body, platform)) continue;
    if (body.vx > 0) body.x = platform.x - body.width;
    else if (body.vx < 0) body.x = platform.x + platform.width;
  }

  body.y += body.vy * dt;
  body.grounded = false;
  for (const platform of platforms) {
    if (!overlaps(body, platform)) continue;
    if (body.vy >= 0) {
      body.y = platform.y - body.height;
      body.grounded = true;
    } else {
      body.y = platform.y + platform.height;
    }
    body.vy = 0;
  }
}
