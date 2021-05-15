<template>
  <svg id="zapper">
    <defs>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feDropShadow dx="0" dy="0" stdDeviation="3"></feDropShadow>
      </filter>
    </defs>
    <path style="filter: url(#glow)" d="M10,0 L100,0"/>
  </svg>
</template>

<script>
//todo clean up this component
export default {
  name: "Beam",
  props:{
    rowId:{
      required:true,
      type: String
    }
  },
  methods:{
  },
  mounted(){
    console.log(this.$props)
    let opts = {
      lineWidth: 4,
      numberOfPoints: 35,
      amplitude: 15,
      spacing: 10,
      margin: 0,
      fixedWidth: 0
    }

// Set up SVG box
    let svg = document.querySelector(`#zapper`)

    let width = opts.fixedWidth || (opts.numberOfPoints - 1) * opts.spacing + opts.margin * 2
    let height = opts.amplitude + opts.margin * 2

    svg.style.width = width + "px"
    svg.style.height = height + "px"

// Generate coordinates
    let points = []
    for(let i = opts.numberOfPoints; i--;)
      points.push(i)

    let animate = () => {

      let coords = points.map(n => {
        let first = n === 0
        let last = n === opts.numberOfPoints - 1
        let x = (width - opts.margin * 2) / (opts.numberOfPoints - 1) * n + opts.margin
        let y = (first || last) ? height / 2 : (height - opts.amplitude) / 2 + Math.random() * opts.amplitude

        return { x, y }
      })

      // Draw path
      let path = svg.querySelector('path')
      path.setAttribute("d", "M" + coords.map(coord => coord.x + "," + coord.y).join(" L"))

      // Style path
      let deviation = Math.random() * (5 - 2) + 2
      path.style.opacity = deviation / 5 + 0.2
      path.style.strokeWidth = opts.lineWidth

      // Style glow
      let glow = svg.querySelector('#glow feDropShadow')
      glow.setAttribute('stdDeviation', deviation)

      // Loop
      requestAnimationFrame(animate)

    }

    // Initiate animation
    requestAnimationFrame(animate)
  }
}
</script>

<style scoped lang="scss">
  svg {
    align-self: center;
    width: 200px;
    height: 100px;
  }
  path {
    stroke: #00ffff;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: #ffffff;
  }
  #glow feDropShadow {
    flood-color: #0000ff;
  }

</style>
