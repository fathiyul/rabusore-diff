"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useWordMap } from "@/hooks/use-word-map"

export default function WordMapPage() {
  const { wordMap, addMapping, removeMapping } = useWordMap()
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
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-amber-700">Word Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-600">
            Define word mappings to treat certain words as equivalent during normalized comparison. For example, map a
            misspelling or alternate spelling to its correct form.
          </p>
          <form onSubmit={handleAddMapping} className="flex items-end gap-4">
            <div className="grid gap-1.5 flex-1">
              <label htmlFor="source" className="text-sm font-medium">
                Source Word
              </label>
              <Input
                id="source"
                placeholder="e.g., behaviour"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5 flex-1">
              <label htmlFor="target" className="text-sm font-medium">
                Target Word
              </label>
              <Input
                id="target"
                placeholder="e.g., behavior"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Mapping</Button>
          </form>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(wordMap).length > 0 ? (
                  Object.entries(wordMap).map(([src, tgt]) => (
                    <TableRow key={src}>
                      <TableCell>{src}</TableCell>
                      <TableCell>{tgt}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeMapping(src)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500">
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
