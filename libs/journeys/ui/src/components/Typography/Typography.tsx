import { ReactElement, MouseEvent } from 'react'
import MuiTypography from '@mui/material/Typography'
import { TreeBlock, useEditor, ActiveTab } from '../..'
import { TypographyFields } from './__generated__/TypographyFields'

export function Typography({
  variant,
  color,
  align,
  content,
  ...props
}: TreeBlock<TypographyFields>): ReactElement {
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    const block: TreeBlock<TypographyFields> = {
      variant,
      color,
      align,
      content,
      ...props
    }

    dispatch({ type: 'SetSelectedBlockAction', block })
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Properties })
    dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
  }

  return (
    <MuiTypography
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={color ?? undefined}
      paragraph={variant === 'overline' || variant === 'caption'}
      gutterBottom
      sx={{
        outline: selectedBlock?.id === props.id ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px'
      }}
      onClick={selectedBlock === undefined ? undefined : handleSelectBlock}
    >
      {content}
    </MuiTypography>
  )
}
