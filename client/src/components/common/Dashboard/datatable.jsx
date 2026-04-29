import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export const DataTable = ({ noticedata }) => {
    const Notices = []

    if (noticedata) {
        for (let index = 0; index < noticedata.notices.length; index++) {
            Notices.push({
                noticeID: index + 1,
                noticeTitle: noticedata.notices[index].title,
                noticeAudience: noticedata.notices[index].audience,
                noticeCreatedBy: `${noticedata.notices[index].createdby["firstname"]} ${noticedata.notices[index].createdby["lastname"]}`,
            })
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b
                border-gray-100 dark:border-[rgba(255,255,255,0.06)]">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-0.5
                        text-blue-500 dark:text-blue-400">
                        Tablón
                    </p>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        Avisos Recientes
                    </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full
                    bg-blue-50 text-blue-600
                    dark:bg-[rgba(99,102,241,0.12)] dark:text-blue-400
                    border border-blue-100 dark:border-[rgba(99,102,241,0.2)]">
                    {Notices.length}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
                {Notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center
                            bg-gray-100 dark:bg-[rgba(255,255,255,0.04)]">
                            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-600">Sin avisos por ahora</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-100 dark:border-[rgba(255,255,255,0.05)]
                                hover:bg-transparent dark:hover:bg-transparent">
                                <TableHead className="w-[60px] text-xs font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-[rgba(255,255,255,0.3)]">
                                    #
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-[rgba(255,255,255,0.3)]">
                                    Título
                                </TableHead>
                                <TableHead className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-[rgba(255,255,255,0.3)]">
                                    Audiencia
                                </TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-[rgba(255,255,255,0.3)]">
                                    Creado por
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {Notices.map((Notice) => (
                                <TableRow
                                    key={Notice.noticeID}
                                    className="border-gray-50 dark:border-[rgba(255,255,255,0.04)]
                                        hover:bg-blue-50/50 dark:hover:bg-[rgba(99,102,241,0.05)]
                                        transition-colors duration-150"
                                >
                                    <TableCell className="font-semibold text-sm
                                        text-blue-500 dark:text-blue-400">
                                        {Notice.noticeID}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium
                                        text-gray-800 dark:text-[rgba(255,255,255,0.8)]">
                                        {Notice.noticeTitle}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full
                                            bg-gray-100 text-gray-500
                                            dark:bg-[rgba(255,255,255,0.06)] dark:text-[rgba(255,255,255,0.4)]">
                                            {Notice.noticeAudience}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-sm
                                        text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                        {Notice.noticeCreatedBy}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
