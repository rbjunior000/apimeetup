import { isBefore } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/meetup';
import Subscription from '../models/subscription';

class SubscribeController {
  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (req.userId === meetup.user_id) {
      return res
        .status(401)
        .json({ error: 'Voce é o organizador dessa Meetup' });
    }
    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'Essa meetup ja aconteceu' });
    }
    const checkIsPossible = await Subscription.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });
    if (checkIsPossible) {
      return res
        .status(400)
        .json({ error: 'voce ja esta inscrito em um meetup nesta data' });
    }
    const subscription = await Subscription.create({
      meetup_id: meetup.id,
      user_id: req.userId,
    });
    return res.json(subscription);
  }

  async index(req, res) {
    const subscription = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscription);
  }
}

export default new SubscribeController();
