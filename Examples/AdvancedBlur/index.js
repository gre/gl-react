const React = require("react");
const Blur = require("./Blur");

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      blurMapSelected: 0,
      maxBlur: 2,
      blurMaps:
      "SzbbUvX,wh0On3P,U1EsATW,r5MOwkI"
      .split(",").map(id => `http://i.imgur.com/${id}.png`)
    };
  }
  render () {
    const { maxBlur, blurMaps, blurMapSelected } = this.state;
    const blurMap = blurMaps[blurMapSelected];
    return <div style={{ width: "1024px" }}>
      <Blur
        width={1024}
        height={483}
        minBlur={0}
        maxBlur={maxBlur}
        blurMap={blurMap}>
        http://i.imgur.com/NjbLHx2.jpg
      </Blur>
      <div>
        <input type="range"
          style={{ width: "420px", height: "50px" }}
          min={0}
          max={4}
          step={0.01}
          value={maxBlur}
          onChange={e => this.setState({ maxBlur: parseFloat(e.target.value) })}
        />
      </div>
      {blurMaps.map((src, i) => {
        return <img key={i}
          src={src}
          onClick={() => this.setState({ blurMapSelected: i })}
          style={{
            width: "100px",
            border: "3px solid",
            borderColor: i===blurMapSelected ? "#f00" : "transparent"
          }}
        />;
      })}
    </div>;
  }
}

React.render(<Demo />, document.getElementById("container"));
