import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { ImageTo3DExperience } from "../../components/experiences/ImageTo3DExperience";

export const ImageTo3DObject = () => {
  useUiLocale();
  return (
    <ImageTo3DExperience
      title={uiText("imageto3dobject.generate.3d.object")}
      subtitle={uiText("desktop.transform.your.image.into.a.3d.object.with.textures")}
      variant="object"
    />
  );
};

export default ImageTo3DObject;

