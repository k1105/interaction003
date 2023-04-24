import dynamic from "next/dynamic";
import p5Types from "p5";
import { MutableRefObject } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { getSmoothedHandpose } from "../lib/getSmoothedHandpose";
import { updateHandposeHistory } from "../lib/updateHandposeHistory";
import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { getShapedRawHandpose } from "../lib/getShapedRawHandpose";

type Props = {
  handpose: MutableRefObject<handPoseDetection.Hand[]>;
};

const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const HandSketch = ({ handpose }: Props) => {
  let handposeHistory: {
    left: Keypoint[][];
    right: Keypoint[][];
  } = { left: [], right: [] };

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.fill(255);
    p5.strokeWeight(10);
  };

  const draw = (p5: p5Types) => {
    handposeHistory = updateHandposeHistory(handpose.current, handposeHistory); //handposeHistoryの更新
    // const hands = getShapedRawHandpose(handpose.current); //平滑化されていない手指の動きを使用する
    const hands = getSmoothedHandpose(handpose.current, handposeHistory); //平滑化された手指の動きを取得する

    p5.background(1, 25, 96);
    [hands.left, hands.right].forEach((hand, index) => {
      if (hand.length > 0) {
        p5.push();
        const fingerNames = [
          "thumb",
          "index finger",
          "middle finger",
          "ring finger",
          "pinky",
        ];

        p5.translate(0, window.innerHeight / 2);

        let start;
        let end;
        for (let n = 0; n < 5; n++) {
          start = 4 * n + 1;
          end = 4 * n + 4;
          p5.push();
          p5.translate((window.innerWidth / 6) * (n + 1), 0);
          p5.push();
          p5.translate(0, 200);
          p5.noStroke();
          p5.textAlign(p5.CENTER);
          p5.textSize(15);
          p5.fill(255);
          p5.text(fingerNames[n], 0, 0);
          p5.pop();
          for (let i = start; i < end; i++) {
            for (let k = 0; k < 5; k++) {
              p5.push();
              p5.rotate((p5.TWO_PI / 5) * k);
              p5.ellipse(
                hand[i].x - hand[start].x,
                hand[i].y - hand[start].y,
                10
              );
              p5.pop();
            }
          }
          p5.pop();
        }

        p5.pop();
      }
    });
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </>
  );
};
