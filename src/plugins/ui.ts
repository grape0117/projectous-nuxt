import Vue from 'vue'
import Dragzone from '@/components/ui/Dragzone.vue'
import Draggable from '@/components/ui/Draggable.vue'

const prefix = 'pj'

Vue.component(`${prefix}-dragzone`, Dragzone)
Vue.component(`${prefix}-draggable`, Draggable)
