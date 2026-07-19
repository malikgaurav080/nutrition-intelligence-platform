import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import DailyLog from '../models/DailyLog';

const router = Router();

// @route   GET /api/logs/:date
// @desc    Get daily log for a specific date (YYYY-MM-DD)
// @access  Private
router.get('/:date', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { date } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Simple date format regex validation: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    let log = await DailyLog.findOne({ userId, date });

    if (!log) {
      // Return a blank template so client doesn't break
      return res.json({
        userId,
        date,
        waterConsumed: 0,
        meals: []
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching log', error: error instanceof Error ? error.message : error });
  }
});

// @route   POST /api/logs/food
// @desc    Log a food item to a specific meal slot
// @access  Private
router.post('/food', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { date, slot, foodId, name, servingSize, servingUnit, baseQty, loggedQty, macros, micros } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!date || !slot || !foodId || !name || !servingSize || !servingUnit || baseQty === undefined || loggedQty === undefined || !macros || !micros) {
      return res.status(400).json({ message: 'Please provide all required food log parameters' });
    }

    let log = await DailyLog.findOne({ userId, date });

    if (!log) {
      log = new DailyLog({
        userId,
        date,
        waterConsumed: 0,
        meals: []
      });
    }

    // Check if food item already logged in this exact slot; if so, replace/update, otherwise push
    const existingIndex = log.meals.findIndex(
      (m) => m.slot === slot && m.foodId === foodId
    );

    const mealData = {
      slot,
      foodId,
      name,
      servingSize,
      servingUnit,
      baseQty,
      loggedQty,
      macros,
      micros
    };

    if (existingIndex > -1) {
      log.meals[existingIndex] = mealData as any;
    } else {
      log.meals.push(mealData as any);
    }

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error logging food', error: error instanceof Error ? error.message : error });
  }
});

// @route   DELETE /api/logs/food/:slot/:foodId
// @desc    Remove a logged food item from a specific meal slot
// @access  Private
router.delete('/food/:date/:slot/:foodId', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { date, slot, foodId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const log = await DailyLog.findOne({ userId, date });

    if (!log) {
      return res.status(404).json({ message: 'Daily log not found for this date' });
    }

    log.meals = log.meals.filter(
      (m) => !(m.slot === slot && m.foodId === foodId)
    ) as any;

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting food log', error: error instanceof Error ? error.message : error });
  }
});

// @route   POST /api/logs/water
// @desc    Update water consumption
// @access  Private
router.post('/water', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { date, waterConsumed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!date || waterConsumed === undefined || waterConsumed < 0) {
      return res.status(400).json({ message: 'Please provide valid date and water amount' });
    }

    let log = await DailyLog.findOne({ userId, date });

    if (!log) {
      log = new DailyLog({
        userId,
        date,
        waterConsumed: 0,
        meals: []
      });
    }

    log.waterConsumed = waterConsumed;
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating water', error: error instanceof Error ? error.message : error });
  }
});

export default router;
