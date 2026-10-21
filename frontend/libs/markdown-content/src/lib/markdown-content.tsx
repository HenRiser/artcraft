import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";

import styles from './markdown-content.module.css';

export function StorytellerMarkdownContent() {
  useUiLocale();
  return (
    <div className={styles['container']}>
      <h1>{uiText("app.welcome.to.storytellermarkdowncontent")}</h1>
    </div>
  );
}

export default StorytellerMarkdownContent;



