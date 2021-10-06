// Copyright 2021 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Editor, { EditorState } from '@paper/editor'
import Bold from '@paper/editor/src/Editor/marks/Bold'
import Code from '@paper/editor/src/Editor/marks/Code'
import Highlight from '@paper/editor/src/Editor/marks/Highlight'
import Italic from '@paper/editor/src/Editor/marks/Italic'
import Link from '@paper/editor/src/Editor/marks/Link'
import Strikethrough from '@paper/editor/src/Editor/marks/Strikethrough'
import Underline from '@paper/editor/src/Editor/marks/Underline'
import Blockquote from '@paper/editor/src/Editor/nodes/Blockquote'
import BulletList from '@paper/editor/src/Editor/nodes/BulletList'
import CodeBlock from '@paper/editor/src/Editor/nodes/CodeBlock'
import Doc from '@paper/editor/src/Editor/nodes/Doc'
import Heading from '@paper/editor/src/Editor/nodes/Heading'
import Math from '@paper/editor/src/Editor/nodes/Math'
import OrderedList from '@paper/editor/src/Editor/nodes/OrderedList'
import Paragraph from '@paper/editor/src/Editor/nodes/Paragraph'
import TagList from '@paper/editor/src/Editor/nodes/TagList'
import Text from '@paper/editor/src/Editor/nodes/Text'
import Title from '@paper/editor/src/Editor/nodes/Title'
import TodoList from '@paper/editor/src/Editor/nodes/TodoList'
import Placeholder from '@paper/editor/src/Editor/plugins/Placeholder'
import Plugins from '@paper/editor/src/Editor/plugins/Plugins'
import Value, { DocJson } from '@paper/editor/src/Editor/plugins/Value'
import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { history, redo, undo } from 'prosemirror-history'
import { undoInputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { useRecoilValue } from 'recoil'
import { accountSelector } from '../../../state/account'
import { Paper } from '../paper'
import useOnSave from '../../../utils/useOnSave'
import styled from '@emotion/styled'
import { useBeforeUnload } from 'react-use'

export interface ObjectViewProps
  extends Pick<
    RouteComponentProps<{
      name: string
      objectId: string
    }>,
    'match'
  > {}

export default function ObjectView(props: ObjectViewProps) {
  const { name: userId, objectId } = props.match.params
  const account = useRecoilValue(accountSelector)
  const [paper, setPaper] = useState<Paper>()
  const [content, setContent] = useState<DocJson>()

  const ref = useRef<{ state?: EditorState; version: number; savedVersion: number }>({
    state: undefined,
    version: 0,
    savedVersion: 0,
  })

  useEffect(() => {
    ;(async () => {
      const object = await account?.draft(objectId)
      if (object) {
        const paper = new Paper(object)
        setPaper(paper)
        const content = await paper.getContent()
        setContent(content)
      }
    })()
  }, [userId, objectId])

  const save = async () => {
    const { state, version, savedVersion } = ref.current
    if (paper && state && version !== savedVersion) {
      await paper.setContent(state.doc.toJSON())
      ref.current.savedVersion = version
      document.title = document.title.replace(/^\**/, '')
    }
  }

  useOnSave(save, [paper, content])

  useBeforeUnload(() => {
    return ref.current.version !== ref.current.savedVersion
  }, 'Discard changes?')

  const extensions = useMemo(() => {
    return [
      new Value({
        defaultValue: content,
        editable: true,
        onDispatchTransaction: (view, tr) => {
          if (tr.docChanged) {
            ref.current.version += 1
            ref.current.state = view.state
            document.title = document.title.replace(/^\**/, '*')
          }
        },
      }),

      new Placeholder(),
      new Doc('title tag_list block+'),
      new Text(),
      new Title(),
      new Paragraph(),
      new Heading(),
      new TagList(),
      new Blockquote(),
      new TodoList(),
      new OrderedList(),
      new BulletList(),
      new CodeBlock(),
      new Math(),

      new Bold(),
      new Italic(),
      new Underline(),
      new Strikethrough(),
      new Highlight(),
      new Code(),
      new Link(),

      new Plugins([
        keymap({
          'Mod-z': undo,
          'Shift-Mod-z': redo,
          'Mod-y': redo,
          Backspace: undoInputRule,
        }),
        keymap(baseKeymap),
        history(),
        gapCursor(),
        dropCursor({ color: 'currentColor' }),
      ]),
    ]
  }, [content])

  return <_Editor extensions={extensions} />
}

const _Editor = styled(Editor)`
  min-height: 100vh;
  padding: 8px;
  padding-bottom: 100px;
  max-width: 800px;
  margin: auto;
`
