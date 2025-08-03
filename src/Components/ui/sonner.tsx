import { themeStore } from "@/stores/themeStore"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

interface Props extends ToasterProps {
  themeAlt?: boolean
}

const Toaster = ({ ...props }: Props) => {
  let { theme } = themeStore()
  if (props.themeAlt) {
    if (theme === 'dark') {
      theme = 'light'
    } else {theme = 'dark'}
  } 

  return (
    <Sonner
      {...props}
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
    />
  )
}

export { Toaster }
