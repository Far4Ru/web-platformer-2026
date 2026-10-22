# Спрайты игры

Игра загружает статичные изображения из этой папки напрямую. Анимации лежат в `assets/animations/` как пары PNG + JSON. Пути заданы в `assets/json/game.json`.

- `objects/` — монета, сундуки, три поверхности платформы, шип, портал и постамент.
- `effects/` — отдельные удары, снаряды, луч и частицы.
- `pickups/` — статичные усилители.

Исходные листы сохранены в `assets/spritesheets/source/`. После изменения источника запустите из корня проекта `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/split-spritesheets.ps1` для статичных PNG и `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-animations.ps1` для анимаций и JSON-атласов.

После повторной нарезки запустите `scripts/build-animations.ps1`, который также обновляет яркую текстуру монеты. Для проверки размеров ресурсов используйте `python scripts/audit-image-sizes.py`.
