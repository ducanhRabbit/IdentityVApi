const { json } = require("express");
const Character = require("../models/Character");

class CharController {
  async getAllChar(req, res, next) {
    try {
      const { page, limit } = req.query;
      const skip = (page - 1) * limit;
      const count = await Character.find();
      const characters = await Character.find()?.skip(skip)?.limit(limit);
      res.set("X-total-count", count.length);
      res.json(characters);
    } catch (err) {
      next(err);
    }
  }

  async getHunters(req, res, next) {
    try {
      const hunters = await Character.find({ role: "hunter" });
      res.json(hunters);
    } catch (err) {
      next(err);
    }
  }

  async getSurvivals(req, res, next) {
    try {
      const survivals = await Character.find({ role: "survival" });
      res.json(survivals);
    } catch (err) {
      next(err);
    }
  }

  async getCharacter(req, res, next) {
    try {
      const { role } = req.query;
      const findChar = await Character.find({ role: role });
      res.json(findChar);
    } catch (err) {
      next(err);
    }
  }

  async charById(req, res, next) {
    try {
      const { id } = req.params;
      try {
        const character = await Character.findById(id);

        if (character) {
          res.json(character);
        }
      } catch (err) {
        throw new Error("Character not found");
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CharController();
