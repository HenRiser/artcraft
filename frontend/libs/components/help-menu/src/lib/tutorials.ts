import { t as uiText } from "@storyteller/common";
export type TutorialItem = {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  category?: string;
};

export enum TutorialCategory {
  Editor3D = "3D Stage",
  Canvas2D = "Image Editor",
}

export const defaultTutorials: TutorialItem[] = [
  {
    id: "turn-images-into-objects",
    get title() { return uiText("help-menu.turn.images.into.3d.objects"); },
    thumbnailUrl:
      "/resources/images/tutorial-thumbnails/Turn_Images_Into_Objects.jpg",
    videoUrl: "https://youtu.be/t8F-sy_zyK4?si=P8lSzuiwSgdRttKa",
    category: TutorialCategory.Editor3D,
  },
  {
    id: "2d-editor-basics",
    get title() { return uiText("help-menu.image.editor.basics"); },
    thumbnailUrl: "/resources/images/tutorial-thumbnails/2D_Editor_Basics.jpg",
    videoUrl: "https://youtu.be/ZASPqlqUBQc?si=U9yRn6KETNJKaUAo",
    category: TutorialCategory.Canvas2D,
  },
  {
    id: "3d-editor-posing",
    get title() { return uiText("help-menu.3d.stage.posing"); },
    thumbnailUrl: "/resources/images/tutorial-thumbnails/3D_Editor_Basics.jpg",
    videoUrl: "https://youtu.be/pM4CxN-isrY?si=XDyG5C1aMIL4KK5O",
    category: TutorialCategory.Editor3D,
  },
];
