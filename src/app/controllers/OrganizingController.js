import Meetup from '../models/meetup';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { user_id: req.userId } });
    return res.json(meetups);
  }
}

export default new OrganizingController();
