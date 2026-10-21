import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { ImageTo3DExperience } from "../../components/experiences/ImageTo3DExperience";

export const ImageTo3DWorld = () => {
  useUiLocale();
  return (
    <ImageTo3DExperience
      title={uiText("common.image.to.3d.world")}
      subtitle={uiText("desktop.generate.3d.worlds.from.an.image.with.world.labs")}
      variant="world"
    />
  );
};

export default ImageTo3DWorld;
