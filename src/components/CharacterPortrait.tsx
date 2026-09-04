import { useState } from "react";
import LivingPortrait, {
  type LivingPortraitExpression,
  type LivingPortraitKind,
} from "@/components/LivingPortrait";
import { portraitUrl } from "@/data/portraits";

type Props = {
  id: string;
  kind: LivingPortraitKind;
  color: string;
  expression?: LivingPortraitExpression;
  className?: string;
};

export default function CharacterPortrait({ id, kind, color, expression = "calm", className }: Props) {
  const [broken, setBroken] = useState(false);
  const url = broken ? null : portraitUrl(id, expression);

  if (url) {
    return (
      <img src={url} alt={`${id} portrait`} className={className} onError={() => setBroken(true)} />
    );
  }

  return (
    <LivingPortrait seed={id} kind={kind} color={color} expression={expression} className={className} />
  );
}
