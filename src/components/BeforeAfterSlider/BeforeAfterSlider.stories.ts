import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { placeholderImage } from '../../internal/placeholder-image'
import { BeforeAfterSlider } from './index'

const beforeSrc = placeholderImage('#3f3f46', '#71717a', 'Before')
const afterSrc = placeholderImage('#0ea5e9', '#22d3ee', 'After')

const meta = {
  title: 'Components/BeforeAfterSlider',
  component: BeforeAfterSlider,
  parameters: {
    layout: 'padded',
  },
  args: {
    beforeSrc,
    afterSrc,
    orientation: 'horizontal',
    modelValue: 50,
    disabled: false,
    autoAnimate: false,
    autoAnimateDuration: 900,
    clickToMove: true,
    'onUpdate:modelValue': fn(),
    onChange: fn(),
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    modelValue: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof BeforeAfterSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabels: Story = {
  args: {
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    aspectRatio: '4 / 3',
  },
}

export const AutoAnimateOnMount: Story = {
  args: {
    autoAnimate: true,
    modelValue: 50,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    modelValue: 65,
  },
}

export const ClickToMoveDisabled: Story = {
  args: {
    clickToMove: false,
  },
}

export const CustomHandle: Story = {
  render: (args) => ({
    components: { BeforeAfterSlider },
    setup() {
      return { args }
    },
    template: `
      <BeforeAfterSlider v-bind="args">
        <template #handle="{ dragging }">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl transition-transform"
            :class="{ 'scale-110': dragging }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <path d="M18 8L22 12L18 16" />
              <path d="M2 12H22" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </template>
      </BeforeAfterSlider>
    `,
  }),
}
