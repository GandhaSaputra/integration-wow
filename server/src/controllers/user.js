const { users, profile, books, transaction, userBookList } = require('../../models');

// exports.addUsers = async (req, res) => {
//   try {
//     await users.create(req.body);

//     res.send({
//       status: 'success',
//       message: 'Add user finished',
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       status: 'failed',
//       message: 'Server Error',
//     });
//   }
// };

exports.getUsers = async (req, res) => {
  try {
    const user = await users.findAll({
      include: [
        {
          model: profile,
          as: "profile",
          attributes: {
            exclude: ["createdAt", "updatedAt", "idUser", "id"],
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
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
    });

    res.send({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await users.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
    });

    res.send({
      status: 'success',
      data: {
        user: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    await users.update(req.body, {
      where: {
        id,
      },
    });

    res.send({
      status: 'success',
      message: `Update user id: ${id} finished`,
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
};

exports.deleteUser = async (req, res) => {
  // code here
  try {
    const { id } = req.params;

    // if(id !== user.id) {
    //   return res.send({
    //     status: "failed",
    //     message: `User with id ${id} not found`
    //   })
    // }

    await users.destroy({
      where: {
        id,
      },
    });

    res.send({
      status: 'success',
      message: `Delete user id: ${id} finished`,
      data: {
        id,
      }
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const data = await users.findAll({
      where: {
        role: "admin"
      },
      include: {
        model: books,
        as: "books",
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        }
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      }
    })

    res.send({
      status: "success",
      data: {
        user: data
      }
    })
    
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
}

exports.getUserTransactions = async (req, res) => {
  try {
    const data = await users.findAll({
      include: {
        model: transaction,
        as: "transactions",
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        }
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "email"],
      }
    })

    res.send({
      status: "success",
      data: {
        users: data
      }
    })
    
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
}

exports.addUserProfile = async (req, res) => {
  try {

    if(req.user.id == 1){
      return res.send({
        status: "Failed",
        message: "Admin Cannot Access This"
      })
    }

    const userProfile = await profile.create(
      {
        phone: req.body.phone,
        gender: req.body.gender,
        address: req.body.address,
        idUser: req.user.id
      }
    );

    res.send({
      status: 'success',
      message: 'Add profile finished',
      data : {
        profile: {
          ...userProfile.dataValues
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

exports.updateUserProfile = async (req, res) => {
  try {

    if(req.user.id == 1){
      return res.send({
        status: "Failed",
        message: "Admin Cannot Access This"
      })
    }

    await profile.update(req.body, {
      where: {
        idUser: req.user.id
      }
    });

    res.send({
      status: 'success',
      message: 'Update profile finished'
    });
    
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
}

exports.userBookList = async (req, res) => {
  try {
    if(req.user.id == 1){
      return res.send({
        status: "Failed",
        message: "Admin cannot access this"
      })
    }
    await userBookList.create({
      idUser: req.user.id,
      idBook: req.body.idBook
    })

    res.send({
      status: "success",
      message: "Add to my list finished"
    })
    
  } catch (error) {
    console.log(error);
    res.send({
      status: 'failed',
      message: 'Server Error',
    });
  }
}