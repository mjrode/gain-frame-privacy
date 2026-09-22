"use client";

import { useState } from "react";
import FeatureIcon, { FoodIllustration } from "./FeatureIcon";
import styles from "./page.module.css";

export default function FoodChatPreview() {
  const [twoSlices, setTwoSlices] = useState(false);

  return <figure className={styles.demo} aria-label="Interactive food chat preview with sample foods">
    <div className={styles.chatLabel}><span>GainFrame</span><span>Try a quick edit</span></div>
    <p className={styles.bubble}>I had two eggs and a slice of toast for breakfast.</p>
    <div className={styles.receipt}>
      <div className={styles.receiptHeader}><strong>{twoSlices ? "Breakfast updated" : "Breakfast logged"}</strong><span><FeatureIcon name="check" /> Saved</span></div>
      <div className={styles.foodRow}><span className={styles.artwork}><FoodIllustration food="eggs" /></span><div><strong>Eggs</strong><small>2 large eggs</small></div><span>144 <small>kcal</small></span></div>
      <div className={styles.foodRow} key={String(twoSlices)}><span className={styles.artwork}><FoodIllustration food="toast" /></span><div><strong>Toast</strong><small>{twoSlices ? "2 slices" : "1 slice"}</small></div><span>{twoSlices ? "240" : "120"} <small>kcal</small></span></div>
      <div className={styles.total} aria-live="polite" aria-atomic="true"><strong>{twoSlices ? "384" : "264"} <small>kcal</small></strong><span>{twoSlices ? "20g protein · 48g carbs · 13g fat" : "16g protein · 24g carbs · 11g fat"}</span></div>
    </div>
    <button className={styles.correctionButton} onClick={() => setTwoSlices(value => !value)}><span>{twoSlices ? "Reset the example" : "Actually, make that two slices of toast."}</span><FeatureIcon name={twoSlices ? "rewind" : "chevron"} /></button>
    <figcaption>Interactive preview with sample estimates. Nothing is saved to a real diary.</figcaption>
  </figure>;
}
