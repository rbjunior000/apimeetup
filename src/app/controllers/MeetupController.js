import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Meetup from '../models/meetup';
import User from '../models/user';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { file_id, date, title, description, location } = req.body;
    const parsedDate = parseISO(date);
    if (isBefore(parsedDate, new Date())) {
      return res.status(400).json({ error: 'data invalida ' });
    }
    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      user_id: req.userId,
      file_id,
    });
    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const meetup = await Meetup.findByPk(req.params.id);
    if (meetup.user_id !== req.userId) {
      return res.json(401).json({ error: 'Nao autorizado' });
    }
    const parsedDate = parseISO(req.body.date);
    if (isBefore(parsedDate, new Date())) {
      return res.status(400).json({ error: 'data invalida ' });
    }
    const { title, description, location, date, file_id } = await meetup.update(
      req.body
    );
    return res.json({ title, description, location, date, file_id });
  }

  async index(req, res) {
    const { date, page } = req.query;
    const parsedDate = parseISO(date);
    const meetup = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });
    return res.json(meetup);
  }

  async delete(req, res) {
    const meetups = await Meetup.findOne({ where: { id: req.params.id } });
    if (meetups.user_id !== req.userId) {
      return res.status(400).json({
        error: 'voce nao tem permissao para deletar este usuario',
      });
    }
    if (isBefore(meetups.date, new Date())) {
      return res.json({
        error: 'Voce nao pode deletar um evento q ja ocorreu',
      });
    }
    await meetups.destroy();
    return res.json({ message: 'meetup deletada' });
  }
}

export default new MeetupController();
