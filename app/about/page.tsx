import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-amber-700">About RabuSore Diff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700">
          <p>
            Welcome to <span className="font-semibold">RabuSore Diff</span>, a specialized tool designed for the
            meticulous comparison of transcription texts. Whether you are a researcher, a linguist, a developer working
            with Speech-to-Text APIs, or anyone in need of detailed text analysis, this tool is built to streamline your
            workflow.
          </p>
          <p>
            The core functionality allows you to compare multiple "hypothesis" texts against a single, definitive
            "ground truth" text. This process is essential for evaluating the accuracy of transcription services and for
            detailed proofreading tasks.
          </p>
          <h3 className="text-lg font-semibold text-slate-800 pt-2">Key Features:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="font-semibold">Multi-Panel Comparison:</span> Compare up to two hypothesis texts against
              a ground truth simultaneously.
            </li>
            <li>
              <span className="font-semibold">Dynamic Ground Truth:</span> Easily designate any panel as the ground
              truth for flexible comparisons.
            </li>
            <li>
              <span className="font-semibold">Word & Character Diffing:</span> Switch between word-level and
              character-level difference highlighting.
            </li>
            <li>
              <span className="font-semibold">Word Error Rate (WER) Metrics:</span> Instantly see key accuracy metrics,
              including substitutions, insertions, and deletions.
            </li>
            <li>
              <span className="font-semibold">Diarization Error Rate (DER):</span> Calculates speaker turn errors based
              on the sequence of speaker labels (e.g., `SPEAKER_01:`), providing metrics for speaker confusion, false
              alarms, and missed speech.
            </li>
            <li>
              <span className="font-semibold">Normalized Mode:</span> Ignore case, punctuation, and apply custom word
              mappings for a more lenient comparison.
            </li>
            <li>
              <span className="font-semibold">Custom Word Map:</span> Define your own word equivalences (e.g., "color"
              vs "colour") on a dedicated page to refine accuracy metrics.
            </li>
          </ul>
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
