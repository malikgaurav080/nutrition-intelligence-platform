import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import MealPlan from '../models/MealPlan';

const router = Router();

// @route   GET /api/meal-plans
// @desc    Get all saved meal plans for the user
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plans = await MealPlan.find({ userId }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching meal plans', error: error instanceof Error ? error.message : error });
  }
});

// @route   POST /api/meal-plans
// @desc    Save a new meal plan (max 3 allowed)
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, meals, planDeficiencies, adjustments, overwriteId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!name || !meals || !Array.isArray(meals)) {
      return res.status(400).json({ message: 'Please provide a valid plan name and meals array' });
    }

    const existingPlans = await MealPlan.find({ userId });

    if (existingPlans.length >= 3 && !overwriteId) {
      return res.status(400).json({
        message: 'Maximum limit of 3 meal plans reached. Please choose one to overwrite.',
        existingPlans: existingPlans.map(p => ({ id: p._id, name: p.name }))
      });
    }

    let plan;

    if (overwriteId) {
      // Overwrite an existing plan
      plan = await MealPlan.findOneAndUpdate(
        { _id: overwriteId, userId },
        { name, meals, planDeficiencies, adjustments },
        { new: true }
      );
      if (!plan) {
        return res.status(404).json({ message: 'Meal plan to overwrite not found' });
      }
    } else {
      // Create new plan
      plan = new MealPlan({
        userId,
        name,
        meals,
        planDeficiencies,
        adjustments,
        isActive: existingPlans.length === 0 // Make it active if it is the first plan
      });
      await plan.save();
    }

    const allPlans = await MealPlan.find({ userId }).sort({ createdAt: -1 });
    res.json(allPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server error saving meal plan', error: error instanceof Error ? error.message : error });
  }
});

// @route   POST /api/meal-plans/:id/active
// @desc    Set a saved plan as the active meal plan
// @access  Private
router.post('/:id/active', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Set all other plans to inactive
    await MealPlan.updateMany({ userId }, { isActive: false });

    // Set selected plan to active
    const plan = await MealPlan.findOneAndUpdate({ _id: id, userId }, { isActive: true }, { new: true });

    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const allPlans = await MealPlan.find({ userId }).sort({ createdAt: -1 });
    res.json(allPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server error setting active plan', error: error instanceof Error ? error.message : error });
  }
});

// @route   DELETE /api/meal-plans/:id
// @desc    Delete a saved meal plan
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const planToDelete = await MealPlan.findOne({ _id: id, userId });
    if (!planToDelete) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const wasActive = planToDelete.isActive;
    await MealPlan.deleteOne({ _id: id, userId });

    // If we deleted the active plan, make the first remaining plan active (if any)
    if (wasActive) {
      const remainingPlan = await MealPlan.findOne({ userId });
      if (remainingPlan) {
        remainingPlan.isActive = true;
        await remainingPlan.save();
      }
    }

    const allPlans = await MealPlan.find({ userId }).sort({ createdAt: -1 });
    res.json(allPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting meal plan', error: error instanceof Error ? error.message : error });
  }
});

export default router;
