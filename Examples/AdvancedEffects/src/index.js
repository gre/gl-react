const React = require("react");
const Banner = require("./Banner");
const Intro = require("./Intro");
const Vignette = require("./Vignette");
const Slideshow = require("./Slideshow");

const styles = {
  root: {
    position: "relative",
    display: "block",
    margin: "0px auto",
    backgroundColor: "#111"
  }
};

class AdvancedEffects extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      time: 0.02,
      frames: 1,
      embeddedImage: "http://i.imgur.com/2VP5osy.jpg",
      images:
       //"MQtLWbD,N8a9CkZ,adCmISK,AedZQ4N,y9qRJR3,brzKTYZ,NSyk07l,EaZiWfn,I1KZdnl,DoQBdzT,slIt2Ww,DA12puU,IYLdRFW,oqmO4Po,T6NaLyI,6XAPrAY,thYzbif,4qmqo3o,8xT2J96,ZCa2pWq,loQfDN2,oabfA68,uOXqDRY,MyyS4vK,fhNYTX4"
        "wxqlQkh,G2Whuq3,0bUSEBX,giP58XN,iKdXwVm,IvpoR40,zJIxPEo,CKlmtPs,fnMylHI,vGXYiYy,MnOB9Le,YqsZKgc,0BJobQo,Otbz312"
          .split(",")
          .map(id => `http://i.imgur.com/${id}.jpg`)
    };
  }

  componentDidMount () {
    let startTime;
    const loop = t => {
      requestAnimationFrame(loop);
      if (!startTime) startTime = t;
      const time = (t - startTime) / 1000;
      this.setState({ time: time, frames: this.state.frames+1 });
    };
    requestAnimationFrame(loop);
  }

  render () {
    const { width: viewportW, height: viewportH } = this.props;
    const {time, frames, images, embeddedImage} = this.state;

    const nbVignettes = 1;
    const imgW = Math.floor(viewportW/nbVignettes);
    const imgH = Math.floor((2/3)*viewportW/nbVignettes);
    const introH = 100;
    const transitionH = Math.floor((2/3)*viewportW);

    return (
      <div style={{ ...styles.root, width: viewportW+"px", height: viewportH+"px" }}>

        <Banner
          time={time}
          width={viewportW}
          height={viewportH - introH - imgH - transitionH}
        />

        <Intro
          time={time}
          fps={frames/time}
          width={viewportW}
          height={introH}
        />

        <Vignette
          time={time}
          width={imgW}
          height={imgH}
          source={embeddedImage}
        />

        <Slideshow
          time={time}
          width={viewportW}
          height={transitionH}
          images={images.slice(2)}
          pauseDuration={0.5}
          transitionDuration={1.5}
        />

      </div>
    );
  }
}

module.exports = AdvancedEffects;
