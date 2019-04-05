using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using flowy.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace flowy.Controllers
{
    public class EmployeeModels
    {
        public int Id { get; set; }
        public string name { get; set; }
        public string mobile { get; set; }
        public string email { get; set; }
        public string dept { get; set; }
        public string erole { get; set; }
    }

    public class Style
    {
        public string left { get; set; }
        public string top { get; set; }
    }

    public class Node
    {
        public string className { get; set; }
        public string id { get; set; }
        public string text { get; set; }
        public Style style { get; set; }
    }

    public class Edge
    {
        public string source { get; set; }
        public string target { get; set; }
        public string labelText { get; set; }
    }

    public class RootObject
    {
        public List<Node> nodes { get; set; }
        public List<Edge> edges { get; set; }
    }

    [Route("api/[controller]")]
    public class ReactController : Controller
    {
        // GET: api/<controller>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        [HttpPost]

        public void Post([FromBody] RootObject model)
        {
          
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
