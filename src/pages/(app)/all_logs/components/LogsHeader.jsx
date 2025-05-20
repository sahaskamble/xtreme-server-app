import { Button } from "@/components/ui/button"
import { RefreshCw, BarChart } from "lucide-react"
import { motion } from "framer-motion"
import DateFilter from "../../dashboard/components/DateFilter"

export default function LogsHeader({ onRefresh, handleDateFilterChange }) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <BarChart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">Monitor and analyze system activity</p>
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <DateFilter onFilterChange={handleDateFilterChange} />
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 group transition-all duration-200"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          <span>Refresh</span>
        </Button>

      </div>
    </motion.div>
  )
}
