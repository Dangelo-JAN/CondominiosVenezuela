import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { useEffect } from "react"
import {
    Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, AlignLeft, AlignCenter,
    AlignRight, Heading2, Minus
} from "lucide-react"

const ToolbarButton = ({ onClick, active, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded-lg transition-all duration-150 ${
            active
                ? "bg-blue-100 text-blue-600 dark:bg-[rgba(99,102,241,0.25)] dark:text-blue-300"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-[rgba(255,255,255,0.4)] dark:hover:bg-[rgba(255,255,255,0.06)] dark:hover:text-white"
        }`}
    >
        {children}
    </button>
)

const Divider = () => (
    <div className="w-px h-5 bg-gray-200 dark:bg-[rgba(255,255,255,0.08)] mx-0.5" />
)

export const RichTextEditor = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "outline-none min-h-[140px] max-h-[260px] overflow-y-auto px-3 py-2 text-sm leading-relaxed"
            }
        }
    })

    // Sync content when value changes externally (e.g. dialog reopens)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "")
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <div className="flex flex-col rounded-xl overflow-hidden
            border border-gray-200 bg-white
            dark:border-[rgba(99,102,241,0.2)] dark:bg-[rgba(255,255,255,0.03)]
            focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100
            dark:focus-within:border-[rgba(99,102,241,0.5)] dark:focus-within:ring-0
            transition-all duration-200">

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5
                border-b border-gray-100 bg-gray-50
                dark:border-[rgba(99,102,241,0.1)] dark:bg-[rgba(255,255,255,0.02)]">

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Título">
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Negrita">
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Cursiva">
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Subrayado">
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Lista">
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Lista numerada">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    active={editor.isActive({ textAlign: "left" })}
                    title="Alinear izquierda">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    active={editor.isActive({ textAlign: "center" })}
                    title="Centrar">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    active={editor.isActive({ textAlign: "right" })}
                    title="Alinear derecha">
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    active={false}
                    title="Línea separadora">
                    <Minus className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor area */}
            <div className="text-gray-800 dark:text-[rgba(255,255,255,0.85)]
                [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-1
                [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4
                [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4
                [&_.ProseMirror_li]:mb-0.5
                [&_.ProseMirror_p]:my-3
                [&_.ProseMirror_hr]:border-gray-200 [&_.ProseMirror_hr]:my-2
                [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Escribe_la_descripción...']
                [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-300
                [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
                [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
                dark:[&_.ProseMirror_hr]:border-[rgba(255,255,255,0.08)]">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
