const React = require("react");
const Blur = require("./Blur");
const Mix = require("./Mix");

function imgurify (slugs) {
  return slugs.split(",").map(id => `http://i.imgur.com/${id}.png`);
}

const styles = {
  toolbar: {
    flexDirection: "row",
    display: "flex"
  },
  tool: {
    flex: 1
  }
};

class Tool extends React.Component {
  render () {
    const { min, max, value, onValueChange, list, selected, onSelect } = this.props;
    return <div style={styles.tool}>
      <div>
        <input type="range"
          style={{ width: "80%", height: "50px" }}
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={e => onValueChange(parseFloat(e.target.value))}
        />
      </div>
      <div>
      {list.map((src, i) => {
        return <img key={i}
          src={src}
          onClick={() => onSelect(i)}
          style={{
            height: "80px",
            border: "2px solid",
            borderColor: i===selected ? "#f00" : "transparent"
          }}
        />;
      })}
      </div>
    </div>;
  }
}

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      maxBlur: 2,
      mix: 0.2,
      mixSelected: 0,
      blurMapSelected: 0,
      mixMaps: imgurify("T7SeRKx,zwvtoYH,qppttqA"),
      blurMaps: imgurify("SzbbUvX,0PkQEk1,z2CQHpg,k9Eview,wh0On3P")
    };
  }
  render () {
    const { maxBlur, blurMaps, blurMapSelected, mixSelected, mix, mixMaps } = this.state;
    const blurMap = blurMaps[blurMapSelected];
    const mixMap = mixMaps[mixSelected];

    const w = 1024, h = 483;

    return <div style={{ width: "1024px" }}>

      <Mix width={w} height={h} factor={mix} map={mixMap} color={[ 0, 0, 0 ]}>
        <Blur
          width={w}
          height={h}
          minBlur={0}
          maxBlur={maxBlur}
          blurMap={blurMap}>
          http://i.imgur.com/NjbLHx2.jpg
        </Blur>
      </Mix>

      <div style={styles.toolbar}>

        <Tool
          min={0}
          max={3}
          value={maxBlur}
          onValueChange={maxBlur => this.setState({ maxBlur })}
          list={blurMaps}
          selected={blurMapSelected}
          onSelect={blurMapSelected => this.setState({ blurMapSelected })}
        />

        <Tool
          min={0}
          max={1}
          value={mix}
          onValueChange={mix => this.setState({ mix })}
          list={mixMaps}
          selected={mixSelected}
          onSelect={mixSelected => this.setState({ mixSelected })}
        />

      </div>
    </div>;
  }
}

React.render(<Demo />, document.getElementById("container"));
