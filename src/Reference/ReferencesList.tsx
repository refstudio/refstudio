import { SuggestionKeyDownProps } from '@tiptap/suggestion'
import { ReferenceItem } from '../types/ReferenceItem'
import './ReferencesList.css'

import {
    forwardRef, useEffect, useImperativeHandle,
    useState,
} from 'react'

export interface ReferencesListProps {
    items: ReferenceItem[]
    command: (referenceItem: ReferenceItem) => any
}

export const ReferencesList = forwardRef((props: ReferencesListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command(item)
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: SuggestionKeyDownProps) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="items">
            {props.items.length
                ? props.items.map((item, index) => (
                    <button
                        className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.id}
                    </button>
                ))
                : <div className="item">No result</div>
            }
        </div>
    )
})