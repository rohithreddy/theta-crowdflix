/**
 * v0 by Vercel.
 * @see https://v0.dev/t/H9xaTFKms2q
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "~~/components/ui/button"
import { Label } from "~~/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "~~/components/ui/popover"
import { Calendar } from "~~/components/ui/calendar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~~/components/ui/select"

export default function Component() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [onDateTimeChange, setOnDateTimeChange] = useState(null)
  useEffect(() => {
    if (onDateTimeChange) {
      const selectedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
      )
      onDateTimeChange(selectedDateTime)
    }
  }, [selectedDate, selectedTime, onDateTimeChange])
  return (
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarDaysIcon className="mr-2 h-4 w-4 -translate-x-1" />
                    {selectedDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 max-w-[276px]">
                  <Calendar mode="single" value={selectedDate} onValueChange={setSelectedDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={selectedTime.getHours().toString()}
                  onValueChange={(value) =>
                    setSelectedTime(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        parseInt(value),
                        selectedTime.getMinutes(),
                      ),
                    )
                  }
                >
                  <SelectTrigger className="h-auto">
                    <SelectValue>{selectedTime.getHours().toString().padStart(2, "0")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTime.getMinutes().toString()}
                  onValueChange={(value) =>
                    setSelectedTime(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        selectedTime.getHours(),
                        parseInt(value),
                      ),
                    )
                  }
                >
                  <SelectTrigger className="h-auto">
                    <SelectValue>{selectedTime.getMinutes().toString().padStart(2, "0")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                      <SelectItem key={minute} value={minute.toString()}>
                        {minute.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              {selectedDate.toLocaleDateString()} at{" "}
              {selectedTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
  )
}

function CalendarDaysIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}