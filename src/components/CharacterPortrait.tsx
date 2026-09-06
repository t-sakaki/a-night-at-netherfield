import { useState } from "react";
import { LivingPortrait, type PortraitExpression, type PortraitKind } from "@/components/LivingPortrait";
import { portraitUrl } from "@/data/portraits";

type Props = {
  id: string;
  kind: PortraitKind;
  color: string;
  expression?: PortraitExpression;
  size?: number;
  title?: string;
};

/** Uses a drop-in art asset if one exists for this id/expression, else falls back to the procedural painted face. */
export function CharacterPortrait({ id, kind, color, expression = "calm", size = 40, title }: Props) {
  const url = portraitUrl(id, expression);
  const [broken, setBroken] = useState(false);

  if (url && !broken) {
    return (
      <img
        className="character-portrait"
        src={url}
        width={size}
        height={size}
        alt={title ? `${title}（${expression}）` : ""}
        aria-hidden={title ? undefined : true}
        loading="lazy"
        draggable={false}
        onError={() => setBroken(true)}
      />
    );
  }
  return <LivingPortrait seed={id} kind={kind} color={color} expression={expression} size={size} title={title} />;
}
