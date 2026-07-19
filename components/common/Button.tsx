export default function Button(props: {children?: React.ReactNode} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{props.children}</button>
}
