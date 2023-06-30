import Vue from 'vue'
import Dragzone from '@/components/ui/Dragzone.vue'
import Draggable from '@/components/ui/Draggable.vue'
import Draggable1 from '@/components/ui/Draggable1.vue'

const prefix = 'pj'

Vue.component(`${prefix}-dragzone`, Dragzone)
Vue.component(`${prefix}-draggable1`, Draggable1)
Vue.component(`${prefix}-draggable`, Draggable)
