'use client'

import { useState, useRef } from 'react'

export default function PlannerPage() {
    const [unassignedRecipes, setUnassignedRecipes] = useState<{ id: string; title: string }[]>([]);
    const [assignedRecipes, setAssignedRecipes] = useState<{ id: string; title: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Create recipe card component types / models
    // Create calendar component - should be minimal. Just 7 * 2 rid with days of the week and meal slots below indicating assigned or not
    // Assigned recipe uses drag and drop to move from unassigned to assigned and vice versa
    // Unassigned will be a carousel if too many to fit on screen
    // Assigned will scroll down if too many to fit on screen with day of the week headers always visible
    return (
        <div className="p-4 space-y-4 bg-neutral text-neutral-content">
            <h1 className="text-2xl font-bold">Meal Planner</h1>
            <div className="flex space-x-4">
                Calender overview {/* replace with calendar component */}
            </div>
            <div className='flex space-x-4'>Unassigned Recipes
                <ul className="list-disc list-inside">
                    <li>map out unassigned recipes into recipe card component</li>
                </ul>   
            </div>
            <div className='flex space-x-4'>Assigned Recipes
                <ul className="list-disc list-inside">
                    <li>map out assigned recipes into recipe card component</li>
                </ul>   
            </div>
        </div>
    )
}