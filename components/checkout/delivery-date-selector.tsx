"use client"

import { useState, useEffect } from "react"
import { format, addDays, isBefore, startOfDay, addHours, setHours, setMinutes } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock } from "lucide-react"

interface DeliveryDateSelectorProps {
  mealType: "brunch" | "dinner"
  isSubscription: boolean
  onDateSelected: (date: Date) => void
  defaultDate?: Date | null
}

export default function DeliveryDateSelector({
  mealType,
  isSubscription,
  onDateSelected,
  defaultDate,
}: DeliveryDateSelectorProps) {
  // Get the current date and time
  const now = new Date()

  // Calculate the minimum delivery date (24 hours from now)
  const minDeliveryDate = addDays(now, 1)

  // Set the delivery time based on meal type (8:30am for brunch, 8:30pm for dinner)
  const deliveryHour = mealType === "brunch" ? 8 : 20
  const deliveryMinute = 30

  // Calculate the next available delivery slot
  const calculateNextAvailableSlot = () => {
    // Start with tomorrow
    let nextSlot = addDays(now, 1)

    // Set the correct time (8:30am or 8:30pm)
    nextSlot = setHours(nextSlot, deliveryHour)
    nextSlot = setMinutes(nextSlot, deliveryMinute)

    // If the calculated time is still less than 24 hours from now,
    // move to the next day
    if (isBefore(nextSlot, addHours(now, 24))) {
      nextSlot = addDays(nextSlot, 1)
    }

    return nextSlot
  }

  // State for the selected date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    // If we have a default date, use it
    if (defaultDate) {
      return defaultDate
    }

    // Otherwise calculate the next available slot
    return calculateNextAvailableSlot()
  })

  // When the date changes, notify the parent component
  useEffect(() => {
    if (selectedDate) {
      onDateSelected(selectedDate)
    }
  }, [selectedDate, onDateSelected])

  // Update the selected date when the meal type changes
  useEffect(() => {
    if (selectedDate) {
      // Keep the same date but update the hour based on meal type
      const updatedDate = new Date(selectedDate)
      updatedDate.setHours(deliveryHour, deliveryMinute, 0, 0)
      setSelectedDate(updatedDate)
    }
  }, [mealType, deliveryHour, deliveryMinute])

  // Function to disable dates within 24 hours
  const disabledDays = (date: Date) => {
    // Disable dates before the minimum delivery date
    return isBefore(date, startOfDay(minDeliveryDate))
  }

  // Format the selected date for display
  const formattedDate = selectedDate
    ? `${format(selectedDate, "EEEE, MMMM d, yyyy")} at ${format(selectedDate, "h:mm a")}`
    : "Select a delivery date"

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">{isSubscription ? "First Delivery Date" : "Delivery Date"}</Label>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>{mealType === "brunch" ? "Delivered at 8:30 AM" : "Delivered at 8:30 PM"}</span>
            </div>
          </div>

          <div className="flex items-center p-2 rounded-md bg-amber-50 border border-amber-200">
            <CalendarIcon className="mr-2 h-5 w-5 text-amber-700" />
            <span className="flex-1">{formattedDate}</span>
            <Button
              variant="outline"
              className="border-amber-700 text-amber-700"
              onClick={() => {
                // Reset to the next available slot
                setSelectedDate(calculateNextAvailableSlot())
              }}
            >
              Reset
            </Button>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                // When a date is selected, set the time to the appropriate delivery time
                const newDate = setHours(setMinutes(date, deliveryMinute), deliveryHour)
                setSelectedDate(newDate)
              }
            }}
            disabled={disabledDays}
            className="rounded-md border"
          />

          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> We require at least 24 hours to prepare your order.
              {isSubscription
                ? " Your subscription will begin on the selected date and continue according to your chosen plan."
                : " Please select a delivery date and time that is at least 24 hours from now."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
