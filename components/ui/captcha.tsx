"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { RefreshCw } from "lucide-react"

interface CaptchaProps {
    onVerify: (verified: boolean) => void
}

export function Captcha({ onVerify }: CaptchaProps) {
    const [num1, setNum1] = useState(0)
    const [num2, setNum2] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [error, setError] = useState(false)

    const generateCaptcha = () => {
        setNum1(Math.floor(Math.random() * 10) + 1)
        setNum2(Math.floor(Math.random() * 10) + 1)
        setUserAnswer("")
        setError(false)
        onVerify(false)
    }

    useEffect(() => {
        generateCaptcha()
    }, [])

    const handleVerify = () => {
        const correctAnswer = num1 + num2
        if (parseInt(userAnswer) === correctAnswer) {
            setError(false)
            onVerify(true)
        } else {
            setError(true)
            onVerify(false)
            generateCaptcha()
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Verify you're human *</label>
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-lg border-2">
                    <span className="font-mono text-lg font-bold">
                        {num1} + {num2} =
                    </span>
                    <Input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => {
                            setUserAnswer(e.target.value)
                            setError(false)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleVerify()
                            }
                        }}
                        placeholder="?"
                        className="w-20 text-center"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateCaptcha}
                        className="flex-shrink-0"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500">
                    Incorrect answer. Please try again.
                </p>
            )}
        </div>
    )
}
