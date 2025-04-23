"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Gift, Award, Star, Coffee, Pizza, Cake } from "lucide-react"

interface Reward {
  id: number
  name: string
  description: string
  points: number
  icon: React.ReactNode
  claimed: boolean
}

export default function LoyaltyRewards() {
  const [isOpen, setIsOpen] = useState(false)
  const [userPoints, setUserPoints] = useState(350)

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "Free Health Juice",
      description: "Get a complimentary health juice with your next order",
      points: 100,
      icon: <Coffee className="h-6 w-6" />,
      claimed: true,
    },
    {
      id: 2,
      name: "Special Dessert",
      description: "Enjoy a free special dessert with your next meal",
      points: 250,
      icon: <Cake className="h-6 w-6" />,
      claimed: true,
    },
    {
      id: 3,
      name: "Free Meal",
      description: "Get one free meal of your choice",
      points: 500,
      icon: <Pizza className="h-6 w-6" />,
      claimed: false,
    },
    {
      id: 4,
      name: "Premium Subscription",
      description: "1 month of premium subscription with special items",
      points: 1000,
      icon: <Award className="h-6 w-6" />,
      claimed: false,
    },
  ])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClaimReward = (id: number) => {
    setRewards(rewards.map((reward) => (reward.id === id ? { ...reward, claimed: true } : reward)))
  }

  // Calculate next reward
  const nextReward = rewards.find((reward) => !reward.claimed)
  const pointsToNextReward = nextReward ? nextReward.points - userPoints : 0
  const progress = nextReward ? (userPoints / nextReward.points) * 100 : 100

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <Card className="w-80 border-amber-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-amber-800">Your Rewards</h3>
                  <div className="flex items-center bg-amber-100 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-amber-700 mr-1 fill-amber-500" />
                    <span className="text-sm font-medium">{userPoints} points</span>
                  </div>
                </div>

                {nextReward && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Next reward: {nextReward.name}</span>
                      <span>
                        {userPoints}/{nextReward.points}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {pointsToNextReward > 0
                        ? `${pointsToNextReward} more points needed`
                        : "You can claim this reward!"}
                    </p>
                  </div>
                )}

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className={`flex items-start p-2 rounded-lg border ${
                        reward.claimed
                          ? "bg-gray-50 border-gray-200"
                          : userPoints >= reward.points
                            ? "bg-amber-50 border-amber-200"
                            : "border-gray-200"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          reward.claimed
                            ? "bg-gray-100 text-gray-500"
                            : userPoints >= reward.points
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {reward.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm">{reward.name}</h4>
                          <span className="text-xs font-medium">{reward.points} pts</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                        {!reward.claimed && userPoints >= reward.points && (
                          <Button
                            size="sm"
                            className="mt-2 h-7 text-xs bg-amber-700 hover:bg-amber-800"
                            onClick={() => handleClaimReward(reward.id)}
                          >
                            Claim Reward
                          </Button>
                        )}
                        {reward.claimed && (
                          <span className="text-xs text-green-600 flex items-center mt-1">
                            <Award className="h-3 w-3 mr-1" /> Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="bg-amber-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        aria-label="Loyalty rewards"
      >
        <Gift className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
