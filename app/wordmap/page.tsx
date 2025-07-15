"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ArrowLeft, Trash2, X, PlusCircle } from "lucide-react"
import { useWordMap } from "@/hooks/use-word-map"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

function AddSourcePopover({ target, onAdd }: { target: string; onAdd: (source: string, target: string) => void }) {
  const [source, setSource] = useState("")
  const [open, setOpen] = useState(false)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (source) {
      onAdd(source, target)
      setSource("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleAdd} className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Add Source</h4>
            <p className="text-sm text-muted-foreground">Add a new source word for "{target}".</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-source">Source Word</Label>
            <Input id="new-source" value={source} onChange={(e) => setSource(e.target.value)} autoFocus />
          </div>
          <Button type="submit">Add</Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default function WordMapPage() {
  const { wordMap, addMapping, removeSource, removeTarget } = useWordMap()
  const [source, setSource] = useState("")
  const [target, setTarget] = useState("")

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault()
    addMapping(source, target)
    setSource("")
    setTarget("")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-amber-700">Word Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-600">
            Define word mappings to treat multiple source words as a single target word during normalized comparison.
          </p>
          <form onSubmit={handleAddMapping} className="flex items-end gap-4">
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="target" className="text-sm font-medium">
                Target Word
              </Label>
              <Input
                id="target"
                placeholder="e.g., behavior"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="source" className="text-sm font-medium">
                Source Word
              </Label>
              <Input
                id="source"
                placeholder="e.g., behaviour"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Mapping</Button>
          </form>
          <div className="border rounded-lg max-h-[40vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50">
                <TableRow>
                  <TableHead className="w-[150px]">Target</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead className="w-[50px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(wordMap).length > 0 ? (
                  Object.entries(wordMap).map(([tgt, srcs]) => (
                    <TableRow key={tgt}>
                      <TableCell className="font-medium">{tgt}</TableCell>
                      <TableCell className="flex flex-wrap gap-2 items-center">
                        {srcs.map((src) => (
                          <Badge key={src} variant="secondary" className="text-sm font-normal">
                            {src}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 rounded-full"
                              onClick={() => removeSource(src, tgt)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        <AddSourcePopover target={tgt} onAdd={addMapping} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeTarget(tgt)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500 h-24">
                      No word mappings defined.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Comparer
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
