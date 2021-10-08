const { users, profile, books, transaction, userBookList } = require('../../models');

const Joi = require('joi');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().min(6).email().required(),
        password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);

    if(error){
        return res.status(400).send({
            status: 'error',
            message: error.details[0].message,
        });
    }

    try {
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = await users.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: "customer",
        });

        const dataToken = {
            id: newUser.id
        }

        const token = jwt.sign(dataToken, process.env.SECRET_KEY)

        const newTransaction = await transaction.create({
          idUser: newUser.id,
          transferProof: "",
          remainingActive: 0,
          userStatus: "Not Active",
          paymentStatus: ""
        })

        const newProfile = await profile.create({
          idUser: newUser.id,
          phone: "",
          gender: "",
          address: "",
        })

        // const newUserBook

        res.status(200).send({
            status: 'success',
            data: {
                user: {
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    profile: newProfile,
                    transaction: newTransaction,
                    token
                }
            }
        });
        
    } catch (error) {
        console.log(error);
        res.send({
            status: 'failed',
            message: 'Server Error',
        });
    }
}

exports.login = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().min(6).email().required(),
        password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send({
            stasus: 'error',
            message: error.details[0].message,
        });
    }
    
    try {
        let userExist = await users.findOne({
            where: {
                email: req.body.email,
            },
            include: [
              {
                model: profile,
                as: "profile",
                attributes: {
                  exclude: ["createdAt", "updatedAt", "idUser"],
                }
              },
              {
                model: books,
                as: "userBookLists",
                through: {
                  model: userBookList,
                  as: "bridge"
                },
                attributes: {
                  exclude: ["createdAt", "updatedAt", "publicationDate", "author", "isbn", "bookFile", "idUser", "id"]
                }
              },
              {
                model: transaction,
                as: "transaction",
                attributes : {
                  exclude: ["createdAt", "updatedAt"]
                }
              }
          ],
            attributes: {
                exclude: ['createdAt', 'updatedAt',],
            },
        });

        const isValid = await bcrypt.compare(req.body.password, userExist.password)

        if (!isValid) {
            return res.status(400).send({
                stasus: 'failed',
                message: 'Email and Password not match',
            });
        }

        const dataToken = {
            id: userExist.id
        }

        const token = jwt.sign(dataToken, process.env.SECRET_KEY)

        userExist = JSON.parse(JSON.stringify(userExist));

        // const userProfile = await profile.findOne({
        //   where: {
        //     idUser: userExist.id
        //   }
        // });

        // const userTransaction = await transaction.findOne({
        //   where: {
        //     idUser: userExist.id
        //   }
        // });

        // const userBookLists = await userBookList.findOne({
        //   where: {
        //     idUser: userExist.id
        //   }
        // });

        // const userEmail = userExist.email;
        // const userName = userExist.name;
        // const userRole = userExist.role;

        res.send({
            status: 'success',
            message: `Welcome to WOW ${userExist.name}`,
            data: {
                user: {
                  ...userExist,
                  token
                }
            }
        });
        
    } catch (error) {
        console.log(error);
        res.send({
            status: 'failed',
            message: 'Server Error',
        });
    }
}

exports.checkAuth = async (req, res) => {
    try {
      const id = req.user.id;
  
      const dataUser = await users.findOne({
        where: {
          id,
        },
        // include: [
        //     {
        //       model: profile,
        //       as: "profile",
        //       attributes: {
        //         exclude: ["createdAt", "updatedAt", "idUser"],
        //       }
        //     },
        //     {
        //       model: books,
        //       as: "userBookLists",
        //       through: {
        //         model: userBookList,
        //         as: "bridge"
        //       },
        //       attributes: {
        //         exclude: ["createdAt", "updatedAt", "publicationDate", "author", "isbn", "bookFile", "idUser", "id"]
        //       }
        //     },
        //     {
        //       model: transaction,
        //       as: "transaction",
        //       attributes : {
        //         exclude: ["createdAt", "updatedAt"]
        //       }
        //     }
        // ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });
  
      if (!dataUser) {
        return res.status(404).send({
          status: "failed",
        });
      }

      const userProfile = await profile.findOne({
        where: {
          idUser: req.user.id
        }
      });

      const userTransaction = await transaction.findOne({
        where: {
          idUser: req.user.id
        }
      });

      const userBookLists = await userBookList.findOne({
        where: {
          idUser: req.user.id
        }
      });
  
      res.send({
        status: "success...",
        data: {
          user: {
            id: dataUser.id,
            name: dataUser.name,
            email: dataUser.email,
            role: dataUser.role,
            profile: userProfile,
            transaction: userTransaction,
            userBookLists: userBookLists
          },
        },
      });
    } catch (error) {
      console.log(error);
      res.status({
        status: "failed",
        message: "Server Error",
      });
    }
  };