# Спрайты игры

Игра загружает статичные изображения из этой папки напрямую. Анимации лежат в `assets/animations/` как пары PNG + JSON. Пути заданы в `assets/json/game.json`.

- `objects/` — монета, сундуки, три поверхности платформы, шип, портал и постамент.
- `effects/` — отдельные удары, снаряды, луч и частицы.
- `pickups/` — статичные усилители.

Исходные листы сохранены в `assets/spritesheets/source/`. После изменения источника запустите из корня проекта `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/split-spritesheets.ps1` для статичных PNG и `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-animations.ps1` для анимаций и JSON-атласов.

Платформы дополнительно собираются в отдельные непрозрачные PNG `left`, `middle`, `right` скриптом `scripts/build-platform-parts.ps1`. Стыки и прозрачность проверяются скриптом `scripts/check-platform-parts.ps1`. После повторной нарезки запустите эти скрипты, затем `scripts/build-animations.ps1`, который также обновляет яркую текстуру монеты.
