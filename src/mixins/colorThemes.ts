import { getCookie } from '@/utils/util-functions'
import { EventBus } from '@/components/event-bus'

export const colorThemes = {
  data() {
    return {
      bgStyle: null,
      bgTheme: null
    }
  },
  computed: {
    default_theme_color(): any {
      // @ts-ignore
      return this.is_theme_colors ? this.background_colors : this.background_colors ? this.toRGB(this.background_colors[0]) : null
    },
    is_theme_colors(): any {
      // @ts-ignore
      return this.bgTheme === JSON.stringify('Colors')
    },
    background_colors(): any {
      // If theme is 'Colors'
      // @ts-ignore
      if (this.is_theme_colors) {
        // @ts-ignore
        return this.bgStyle
      }
      // If theme is 'Images'
      // @ts-ignore
      return this.bgStyle.rgba_colors
    }
  },
  methods: {
    toRGB(rgb: any) {
      if (!rgb) return null
      const { r, g, b } = rgb
      if (r && g && b) return `rgb(${r}, ${g}, ${b})`
    }
  },
  created() {
    let bgStyle = getCookie('bg-style')
    if (bgStyle) {
      // If bgStyle is an object
      if (bgStyle && Object.keys(bgStyle).length > 0) {
        // @ts-ignore
        this.bgStyle = JSON.parse(bgStyle)
      } else {
        // If bgStyle is a string
        // @ts-ignore
        this.bgStyle = bgStyle
      }
    }
    if (getCookie('bg-theme')) {
      // @ts-ignore
      this.bgTheme = getCookie('bg-theme')
    }
  },
  mounted() {
    // @ts-ignore
    EventBus.$on('changeBackground', ({ option, theme }) => {
      if (theme === 'Colors') {
        // @ts-ignore
        this.bgTheme = JSON.stringify(theme)
      } else {
        // @ts-ignore
        this.bgTheme = theme
      }
      // @ts-ignore
      this.bgStyle = option
    })
  }
}
