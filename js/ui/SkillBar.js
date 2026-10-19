import { drawSkillIcon } from '../mock/skillIcons.js';

export class SkillBar {
  constructor(ui, canvasWidth) {
    this.ui = ui;
    this.canvasWidth = canvasWidth;
  }

  render(ctx, game) {
    const skills = ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow']
      .map((kind) => ({ kind, skill: game[`${kind}Skill`] }))
      .filter(({ skill }) => skill.level > 0);
    if (!skills.length) return;

    const { size, gap, y, colors } = this.ui.skills;
    const startX = (this.canvasWidth - skills.length * size - (skills.length - 1) * gap) / 2;
    skills.forEach(({ kind, skill }, index) => {
      const rect = { x: startX + index * (size + gap), y, width: size, height: size };
      drawSkillIcon(ctx, kind, rect, colors, skill.cooldown === 0);
      ctx.save();
      ctx.fillStyle = colors.text;
      ctx.font = `14px ${this.ui.font}`;
      ctx.textAlign = 'left';
      ctx.fillText(`III`.slice(0, skill.level), rect.x + 4, rect.y + size - 5);
      ctx.restore();
      if (skill.cooldown > 0) {
        ctx.save();
        ctx.fillStyle = colors.text;
        ctx.font = `16px ${this.ui.font}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(Math.ceil(skill.cooldown), rect.x + size - 4, rect.y + size - 3);
        ctx.restore();
      }
    });
  }
}
